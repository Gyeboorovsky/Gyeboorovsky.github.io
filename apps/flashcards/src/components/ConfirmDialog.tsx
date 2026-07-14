import { useI18n } from '../i18n';

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Sticker-styled destructive-action confirm (replaces window.confirm). */
export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  const t = useI18n();
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal confirm-modal" role="alertdialog" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-text">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            {t.confirm.cancel}
          </button>
          <button className="btn btn-danger" onClick={onConfirm} autoFocus>
            {t.confirm.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
