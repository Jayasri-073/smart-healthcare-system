import Modal from './Modal';

const ConfirmModal = ({
  show, title, message, confirmText = 'Confirm', variant = 'danger', loading, onConfirm, onClose,
}) => (
  <Modal
    show={show}
    title={title}
    onClose={onClose}
    footer={
      <>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
          No, go back
        </button>
        <button className={`btn btn-${variant}`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait...' : confirmText}
        </button>
      </>
    }
  >
    <p className="mb-0">{message}</p>
  </Modal>
);

export default ConfirmModal;