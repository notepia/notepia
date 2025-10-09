import { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteFile, FileInfo, getFileDownloadUrl, listFiles, renameFile, uploadFile } from '../../../api/file';
import { useToastStore } from '../../../stores/toast';
import { Download, FileIcon, Trash2, Upload, Edit2, X, Check, Search, Filter, Eye, Image as ImageIcon, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

const FilesPage = () => {
    const { t } = useTranslation();
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const [isDragging, setIsDragging] = useState(false);
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [editingFileName, setEditingFileName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [extFilter, setExtFilter] = useState<string>('');
    const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(20);
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    const { data: filesData, isLoading } = useQuery({
        queryKey: ['files', workspaceId, searchQuery, extFilter, pageNumber, pageSize],
        queryFn: () => listFiles(workspaceId!, searchQuery, extFilter, pageSize, pageNumber),
        enabled: !!workspaceId,
    });

    const uploadMutation = useMutation({
        mutationFn: (file: File) => uploadFile(workspaceId!, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files', workspaceId] });
            addToast({ type: 'success', message: t('files.upload_success') });
        },
        onError: () => {
            addToast({ type: 'error', message: t('files.upload_error') });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (fileId: string) => deleteFile(workspaceId!, fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files', workspaceId] });
            addToast({ type: 'success', message: t('files.delete_success') });
        },
        onError: () => {
            addToast({ type: 'error', message: t('files.delete_error') });
        },
    });

    const renameMutation = useMutation({
        mutationFn: ({ fileId, newName }: { fileId: string; newName: string }) =>
            renameFile(workspaceId!, fileId, newName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files', workspaceId] });
            setEditingFileId(null);
            addToast({ type: 'success', message: t('files.rename_success') });
        },
        onError: () => {
            addToast({ type: 'error', message: t('files.rename_error') });
        },
    });

    const handleFileUpload = async (files: FileList | null) => {
        if (!files) return;
        for (let i = 0; i < files.length; i++) {
            await uploadMutation.mutateAsync(files[i]);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    }, [workspaceId]);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const startEdit = (file: FileInfo) => {
        setEditingFileId(file.id);
        setEditingFileName(file.original_name);
    };

    const cancelEdit = () => {
        setEditingFileId(null);
        setEditingFileName('');
    };

    const saveEdit = (fileId: string) => {
        if (editingFileName.trim()) {
            renameMutation.mutate({ fileId, newName: editingFileName });
        }
    };

    const isImageFile = (ext: string) => {
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext.toLowerCase());
    };

    const isTextFile = (ext: string) => {
        return ['.txt', '.md', '.json', '.xml', '.csv', '.log', '.js', '.ts', '.tsx', '.jsx', '.css', '.html', '.py', '.go', '.java', '.c', '.cpp', '.h'].includes(ext.toLowerCase());
    };

    const canPreview = (file: FileInfo) => {
        return isImageFile(file.ext) || isTextFile(file.ext);
    };

    const getFileExtensions = () => {
        if (!filesData?.files) return [];
        const exts = new Set(filesData.files.map(f => f.ext));
        return Array.from(exts).filter(Boolean);
    };

    // Reset page number when search query or filter changes
    useEffect(() => {
        setPageNumber(1);
    }, [searchQuery, extFilter]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-neutral-500">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                    {t('menu.files')}
                </h1>

                {/* Search and Filter Bar */}
                <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('files.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                        <select
                            value={extFilter}
                            onChange={(e) => setExtFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 appearance-none"
                        >
                            <option value="">{t('files.all_types')}</option>
                            {getFileExtensions().map(ext => (
                                <option key={ext} value={ext}>{ext}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div
                    className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-colors ${
                        isDragging
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            {t('files.drag_drop')}
                        </p>
                        <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
                            <Upload size={16} />
                            <span>{t('files.select_files')}</span>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e.target.files)}
                            />
                        </label>
                    </div>
                </div>

                {filesData?.files && filesData.files.length > 0 ? (
                    <>
                        <div className="grid gap-4">
                            {filesData.files.map((file) => (
                                <motion.div
                                    key={file.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    {isImageFile(file.ext) ? (
                                        <ImageIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
                                    ) : isTextFile(file.ext) ? (
                                        <FileText className="h-8 w-8 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <FileIcon className="h-8 w-8 text-neutral-400 flex-shrink-0" />
                                    )}

                                    <div className="flex-1 min-w-0">
                                        {editingFileId === file.id ? (
                                            <input
                                                type="text"
                                                value={editingFileName}
                                                onChange={(e) => setEditingFileName(e.target.value)}
                                                className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEdit(file.id);
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                                {file.original_name}
                                            </h3>
                                        )}
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {formatFileSize(file.size)} • {formatDate(file.created_at)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {editingFileId === file.id ? (
                                            <>
                                                <button
                                                    onClick={() => saveEdit(file.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                                                    title={t('common.save')}
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-2 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                                                    title={t('common.cancel')}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {canPreview(file) && (
                                                    <button
                                                        onClick={() => setPreviewFile(file)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                                        title={t('files.preview')}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => startEdit(file)}
                                                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                                                    title={t('files.rename')}
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <a
                                                    href={getFileDownloadUrl(workspaceId!, file.name)}
                                                    download={file.original_name}
                                                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                                                    title={t('files.download')}
                                                >
                                                    <Download size={18} />
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(t('files.delete_confirm'))) {
                                                            deleteMutation.mutate(file.id);
                                                        }
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                    title={t('files.delete')}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {filesData.files.length === pageSize && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button
                                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                    disabled={pageNumber === 1}
                                    className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="px-4 py-2 text-neutral-700 dark:text-neutral-300">
                                    {pageNumber}
                                </span>
                                <button
                                    onClick={() => setPageNumber(p => p + 1)}
                                    disabled={filesData.files.length < pageSize}
                                    className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-neutral-500">
                        {searchQuery || extFilter ? t('files.no_results') : t('files.no_files')}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={() => setPreviewFile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                    {previewFile.original_name}
                                </h2>
                                <button
                                    onClick={() => setPreviewFile(null)}
                                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                                {isImageFile(previewFile.ext) ? (
                                    <img
                                        src={getFileDownloadUrl(workspaceId!, previewFile.name)}
                                        alt={previewFile.original_name}
                                        className="max-w-full h-auto mx-auto"
                                    />
                                ) : (
                                    <iframe
                                        src={getFileDownloadUrl(workspaceId!, previewFile.name)}
                                        className="w-full h-[70vh] border-0"
                                        title={previewFile.original_name}
                                    />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FilesPage;