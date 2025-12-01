import { chartDBContext } from '@/context/chartdb-context/chartdb-context';
import { diagramToJSONOutput } from '@/lib/export-import-utils';
import React, { useContext, useEffect, useState } from 'react';

function supportsFileSystemAccess(): boolean {
    return 'showSaveFilePicker' in window;
}

interface WindowWithFileSystem extends Window {
    showSaveFilePicker(options?: {
        suggestedName?: string;
        types?: Array<{
            description?: string;
            accept: Record<string, string[]>;
        }>;
    }): Promise<FileSystemFileHandle>;
}

export function SchemaExporter() {
    const { currentDiagram } = useContext(chartDBContext);

    const [autoSave, setAutoSave] = useState(false);
    const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
        null
    );

    const setupFile = async () => {
        if (!supportsFileSystemAccess()) {
            alert(
                'Your browser does not support this feature. Use Chrome or Edge.'
            );
            return;
        }

        try {
            const handle = await (
                window as WindowWithFileSystem
            ).showSaveFilePicker({
                suggestedName: `${currentDiagram.name || 'db-schema'}.chartdb.json`,
                types: [
                    {
                        description: 'ChartDB Schema',
                        accept: { 'application/json': ['.json'] },
                    },
                ],
            });
            setFileHandle(handle);
            setAutoSave(true);
        } catch (err: unknown) {
            console.log('Annullato', err);
        }
    };

    useEffect(() => {
        if (!autoSave || !fileHandle) return;

        const saveSchema = async () => {
            try {
                // Usa la funzione ufficiale di ChartDB per esportare
                const json = diagramToJSONOutput(currentDiagram);

                const writable = await fileHandle.createWritable();
                await writable.write(json);
                await writable.close();

                console.log('✓ Schema auto-saved');
            } catch (err) {
                console.error('Failed to auto-save:', err);
                setAutoSave(false);
                setFileHandle(null);
            }
        };

        const timeout = setTimeout(saveSchema, 1000);
        return () => clearTimeout(timeout);
    }, [autoSave, fileHandle, currentDiagram]);

    if (!supportsFileSystemAccess()) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-sm text-yellow-700">
                    Usa Chrome o Edge per questa funzionalità
                </p>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={setupFile}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
            >
                <span>{autoSave ? '✅' : '📁'}</span>
                {autoSave ? 'Auto-save attivo' : 'Configura auto-save'}
            </button>

            {autoSave && (
                <button
                    onClick={() => {
                        setAutoSave(false);
                        setFileHandle(null);
                    }}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-300"
                >
                    Disattiva
                </button>
            )}
        </div>
    );
}
