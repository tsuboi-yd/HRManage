'use client';
import { useRouter } from 'next/navigation';

interface CheckItem {
  label: string;
  done: boolean;
  sub: string;
  linkLabel: string;
  href: string;
}

interface Props {
  items: CheckItem[];
  onClose: () => void;
  onSubmit: () => void;
}

function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-symbols-rounded ${className}`} style={{ fontSize: size, lineHeight: 1 }}>
      {name}
    </span>
  );
}

export default function BulkSubmitModal({ items, onClose, onSubmit }: Props) {
  const router = useRouter();
  const allDone = items.every(i => i.done);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#00000066' }}>
      <div
        className="flex flex-col rounded-2xl overflow-hidden"
        style={{
          width: 600,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 8px 32px #00000033',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #E0E0E0' }}
        >
          <div className="flex items-center gap-2.5">
            <Icon name="fact_check" size={28} className="text-[#1976D2]" />
            <span className="text-[20px] font-bold text-[#212121]">一括申請の確認</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#F5F5F5]"
          >
            <Icon name="close" size={22} className="text-[#757575]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-6">
          <p className="text-sm text-[#757575] leading-relaxed">
            以下の計画内容を確認し、すべて入力済みであることをご確認ください。未入力の項目がある場合はリンクから該当画面に移動して入力してください。
          </p>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-[10px] px-5 py-4"
                style={{
                  backgroundColor: item.done ? '#E8F5E9' : '#FFF3E0',
                  border: `1px solid ${item.done ? '#C8E6C9' : '#FFE0B2'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-full"
                    style={{ backgroundColor: item.done ? '#388E3C' : '#F57C00' }}
                  >
                    <Icon
                      name={item.done ? 'check' : 'priority_high'}
                      size={18}
                      className="text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-semibold text-[#212121]">{item.label}</span>
                    <span
                      className="text-[12px]"
                      style={{
                        color: item.done ? '#388E3C' : '#F57C00',
                        fontWeight: item.done ? 400 : 600,
                      }}
                    >
                      {item.sub}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { onClose(); router.push(item.href); }}
                  className="flex items-center gap-1 text-[13px] font-medium text-[#1976D2] hover:underline"
                >
                  {item.linkLabel}
                  <Icon name="chevron_right" size={18} className="text-[#1976D2]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-5 rounded-b-2xl"
          style={{ backgroundColor: '#F5F5F5' }}
        >
          {!allDone ? (
            <div className="flex items-center gap-1.5">
              <Icon name="info" size={18} className="text-[#F57C00]" />
              <span className="text-[13px] text-[#757575]">未入力の項目があります。すべて入力後に申請してください。</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Icon name="check_circle" size={18} className="text-[#388E3C]" />
              <span className="text-[13px] text-[#388E3C] font-medium">すべての項目が入力済みです。</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-[#757575]"
              style={{ border: '1px solid #BDBDBD' }}
            >
              キャンセル
            </button>
            <button
              onClick={allDone ? onSubmit : undefined}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: allDone ? '#1976D2' : '#BDBDBD',
                color: allDone ? '#FFFFFF' : '#757575',
                opacity: allDone ? 1 : 0.5,
                cursor: allDone ? 'pointer' : 'not-allowed',
              }}
            >
              <Icon name="send" size={18} className={allDone ? 'text-white' : 'text-[#757575]'} />
              申請する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
