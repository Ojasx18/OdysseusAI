import { Bookmark } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

function SavedPlacesPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <EmptyState
        title="No saved places"
        description="Bookmark interesting locations, hotels, and attractions during planning to view them here later."
        icon={Bookmark}
      />
    </div>
  );
}

export default SavedPlacesPage;
