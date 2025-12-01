import type { ChartDBContext } from '@/context/chartdb-context/chartdb-context';
import { chartDBContext } from '@/context/chartdb-context/chartdb-context';
import React, { useContext, useEffect, useMemo, useState } from 'react';

type SchemaExporterData = Pick<
    ChartDBContext,
    | 'currentDiagram'
    | 'tables'
    | 'relationships'
    | 'dependencies'
    | 'areas'
    | 'customTypes'
    | 'notes'
    | 'schemas'
>;

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
    const {
        currentDiagram,
        tables,
        relationships,
        dependencies,
        areas,
        customTypes,
        notes,
        schemas,
    } = useContext(chartDBContext);

    const [autoSave, setAutoSave] = useState(false);
    const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
        null
    );

    const schemaData = useMemo((): SchemaExporterData => {
        return {
            currentDiagram,
            tables,
            relationships,
            dependencies,
            areas,
            customTypes,
            notes,
            schemas,
        };
    }, [
        areas,
        currentDiagram,
        customTypes,
        dependencies,
        notes,
        relationships,
        schemas,
        tables,
    ]);

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
                suggestedName: `${currentDiagram.name || 'db-schema'}.json`,
                types: [
                    {
                        description: 'JSON Files',
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
                const diagramData = {
                    id: currentDiagram.id,
                    name: currentDiagram.name,
                    databaseType: currentDiagram.databaseType,
                    databaseEdition: currentDiagram.databaseEdition,
                    tables: currentDiagram.tables,
                    relationships: currentDiagram.relationships,
                    dependencies: currentDiagram.dependencies,
                    areas: currentDiagram.areas,
                    customTypes: currentDiagram.customTypes,
                    notes: currentDiagram.notes,
                    createdAt: currentDiagram.createdAt,
                    updatedAt: currentDiagram.updatedAt,
                };

                const writable = await fileHandle.createWritable();

                await writable.write(JSON.stringify(diagramData, null, 2));
                await writable.close();
            } catch (err) {
                console.error(err);
            }
        };

        const timeout = setTimeout(saveSchema, 1000);
        return () => clearTimeout(timeout);
    }, [
        autoSave,
        fileHandle,
        schemaData,
        currentDiagram.updatedAt,
        currentDiagram.id,
        currentDiagram.name,
        currentDiagram.databaseType,
        currentDiagram.databaseEdition,
        currentDiagram.tables,
        currentDiagram.relationships,
        currentDiagram.dependencies,
        currentDiagram.areas,
        currentDiagram.customTypes,
        currentDiagram.notes,
        currentDiagram.createdAt,
    ]);

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
                    onClick={() => setAutoSave(false)}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-300"
                >
                    Disattiva
                </button>
            )}
        </div>
    );
}
