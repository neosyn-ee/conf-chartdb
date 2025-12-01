// types/file-system-access.d.ts
interface FilePickerAcceptType {
    description?: string;
    accept: Record<string, string[]>;
}

interface FilePickerOptions {
    types?: FilePickerAcceptType[];
    excludeAcceptAllOption?: boolean;
    suggestedName?: string;
}

interface FileSystemWritableFileStream extends WritableStream {
    write(data: string | BufferSource | Blob): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
}

interface FileSystemFileHandle {
    readonly kind: 'file';
    readonly name: string;
    getFile(): Promise<File>;
    createWritable(): Promise<FileSystemWritableFileStream>;
}

interface Window {
    showSaveFilePicker(
        options?: FilePickerOptions
    ): Promise<FileSystemFileHandle>;
    showOpenFilePicker(
        options?: FilePickerOptions
    ): Promise<FileSystemFileHandle[]>;
}
