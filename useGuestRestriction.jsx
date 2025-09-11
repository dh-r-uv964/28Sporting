import { useState, useCallback } from 'react';
import { User } from '@/api/entities';

export default function useGuestRestriction() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});

  const checkGuestRestriction = useCallback(async (actionTitle, actionDescription) => {
    try {
      await User.me();
      return true;
    } catch (error) {
      setModalProps({ actionTitle, actionDescription });
      setIsModalOpen(true);
      return false;
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalProps({});
  }, []);

  return { checkGuestRestriction, isModalOpen, modalProps, closeModal };
}