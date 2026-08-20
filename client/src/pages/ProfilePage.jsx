import { useState } from 'react';
import { User, Mail, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

function ProfilePage() {
  const { user } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setTimeout(() => {
      setProfileLoading(false);
      alert('Profile details saved (Simulated)');
    }, 1500);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setPasswordModalOpen(false);
      alert('Password updated successfully (Simulated)');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem 0' }}>
      <Card title="Account Settings" subtitle="Manage your profile information and security settings." gradient={true}>
        <form onSubmit={handleProfileSave}>
          <Input
            label="Full Name"
            defaultValue={user?.name}
            icon={User}
            required
            disabled={profileLoading}
          />
          <Input
            label="Email Address"
            defaultValue={user?.email}
            type="email"
            icon={Mail}
            required
            disabled={profileLoading}
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Button type="submit" variant="primary" loading={profileLoading}>
              Save Profile
            </Button>
            <Button
              variant="outline"
              icon={Lock}
              onClick={() => setPasswordModalOpen(true)}
              disabled={profileLoading}
            >
              Change Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Update Security Credentials"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handlePasswordSave}
              loading={passwordLoading}
            >
              Update Password
            </Button>
          </>
        }
      >
        <form onSubmit={handlePasswordSave} id="password-form">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            required
            disabled={passwordLoading}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            required
            disabled={passwordLoading}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            required
            disabled={passwordLoading}
          />
        </form>
      </Modal>
    </div>
  );
}

export default ProfilePage;
