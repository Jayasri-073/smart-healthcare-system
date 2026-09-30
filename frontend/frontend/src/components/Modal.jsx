// Simple modal built with Bootstrap CSS classes (no Bootstrap JavaScript needed)
const Modal = ({ show, title, onClose, children, footer, size = '' }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal d-block" tabIndex="-1" onClick={onClose}>
        <div
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
};

export default Modal;