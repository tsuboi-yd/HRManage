type StatusType = '在籍中' | '転出予定' | '転入予定' | '退職予定' | '承認申請中' | '差戻中' | '承認済み' | '保留中' | '採用予定' | '承認待ち' | '下書き保存';

const STATUS_STYLES: Record<StatusType, { bg: string; color: string }> = {
  在籍中:      { bg: '#E8F5E9', color: '#388E3C' },
  転出予定:    { bg: '#FFF3E0', color: '#F57C00' },
  転入予定:    { bg: '#E1F5FE', color: '#0288D1' },
  退職予定:    { bg: '#FFEBEE', color: '#D32F2F' },
  承認申請中:  { bg: '#E3F2FD', color: '#1976D2' },
  差戻中:      { bg: '#FFEBEE', color: '#D32F2F' },
  承認済み:    { bg: '#E8F5E9', color: '#388E3C' },
  保留中:      { bg: '#FFF3E0', color: '#F57C00' },
  採用予定:    { bg: '#E8F5E9', color: '#388E3C' },
  承認待ち:    { bg: '#FFF8E1', color: '#F57C00' },
  下書き保存:  { bg: '#F5F5F5', color: '#757575' },
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status as StatusType] ?? { bg: '#F5F5F5', color: '#757575' };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}
