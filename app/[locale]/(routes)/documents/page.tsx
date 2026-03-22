import { getDocuments } from "@/actions/documents/get-documents";
import { DocumentsDataTable } from "./components/data-table";
import { columns } from "./components/columns";
import ModalDropzone from "./components/modal-dropzone";

const DocumentsPage = async () => {
  const documents = await getDocuments();

  if (!documents) {
    return <div>Something went wrong</div>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between py-5">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Documents</h2>
        <div className="flex space-x-3">
          <ModalDropzone buttonLabel="Upload PDF" fileType="pdfUploader" />
          <ModalDropzone buttonLabel="Upload Image" fileType="imageUploader" />
          <ModalDropzone buttonLabel="Upload Other" fileType="docUploader" />
        </div>
      </div>
      <DocumentsDataTable data={documents} columns={columns} />
    </div>
  );
};

export default DocumentsPage;
