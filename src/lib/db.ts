import { supabase } from './supabase';

export type Album = {
    id: string;
    name: string;
    parent_id: string | null;
    created_at?: string;
};

export type Media = {
    id: string;
    album_id: string;
    type: 'image' | 'video';
    url: string;
    title: string | null;
    description: string | null;
    created_at?: string;
};

export const db = {
    // Album operations
    async getAlbums(parentId: string | null = null) {
        let query = supabase.from('albums').select('*');
        if (parentId === 'all') {
            // allの場合は絞り込まない
        } else if (parentId) {
            query.eq('parent_id', parentId);
        } else {
            query.is('parent_id', null);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data as Album[];
    },

    async createAlbum(name: string, parentId: string | null = null) {
        const { data, error } = await supabase
            .from('albums')
            .insert([{ name, parent_id: parentId }])
            .select()
            .single();
        if (error) throw error;
        return data as Album;
    },

    async updateAlbum(id: string, name: string) {
        const { data, error } = await supabase
            .from('albums')
            .update({ name })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Album;
    },

    async deleteAlbum(id: string) {
        const { error } = await supabase.from('albums').delete().eq('id', id);
        if (error) throw error;
    },

    // Media operations
    async getMedia(albumId: string | null = null, searchQuery: string = '') {
        let query = supabase.from('media').select('*');

        // 特定アルバムが指定されている場合のみフィルタリング
        // null / '' / 'root' の場合はフィルタなし → すべての写真を返す
        if (albumId && albumId !== 'root' && albumId !== '') {
            query = query.eq('album_id', albumId);
        }

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data as Media[];
    },


    async addMedia(albumId: string, type: 'image' | 'video', url: string, title: string, description: string = '') {
        const { data, error } = await supabase
            .from('media')
            .insert([{
                album_id: albumId === 'root' ? null : albumId,
                type,
                url,
                title,
                description
            }])
            .select()
            .single();
        if (error) throw error;
        return data as Media;
    },

    async updateMedia(id: string, title: string, description?: string) {
        const updateData: any = { title };
        if (description !== undefined) {
            updateData.description = description;
        }

        const { data, error } = await supabase
            .from('media')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Media;
    },

    async getMediaById(id: string) {
        const { data, error } = await supabase
            .from('media')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data as Media;
    },


    async deleteMedia(id: string) {
        const { error } = await supabase.from('media').delete().eq('id', id);
        if (error) throw error;
    },

    // Breadcrumbs (get ancestors)
    async getBreadcrumbs(albumId: string) {
        const breadcrumbs: Album[] = [];
        let currentId: string | null = albumId;

        while (currentId) {
            const { data, error }: { data: Album | null; error: any } = await supabase
                .from('albums')
                .select('*')
                .eq('id', currentId)
                .single();

            if (error || !data) break;
            breadcrumbs.unshift(data);
            currentId = data.parent_id;
        }

        return breadcrumbs;
    }
};
