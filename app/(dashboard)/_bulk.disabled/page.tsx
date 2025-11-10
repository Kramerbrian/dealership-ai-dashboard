import BulkUploadPanel from '@/components/BulkUploadPanel'

export default function BulkPage(){
  return (
    <main className='p-6 space-y-6 bg-gray-950 min-h-screen'>
      <h1 className='text-xl font-semibold text-white'>Bulk Upload</h1>
      <BulkUploadPanel />
    </main>
  )
}

