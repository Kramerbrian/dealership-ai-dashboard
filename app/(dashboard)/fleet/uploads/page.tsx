import BulkUpload from '@/components/fleet/BulkUploadPage';

export default function BulkUploadPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Bulk Upload Origins (CSV)</h1>
        <p className="text-gray-400">
          Upload a CSV with <code className="bg-neutral-900 px-1 rounded">origin,tenant</code> columns. Preview results, fix issues inline, then commit.
        </p>
      </div>
      <BulkUpload />
    </div>
  );
}

