import React from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import MediaLibrary from '../components/admin/media/MediaLibrary';

export const Media: React.FC = () => {
  return (
    <MainLayout>
      <MediaLibrary />
    </MainLayout>
  );
};
