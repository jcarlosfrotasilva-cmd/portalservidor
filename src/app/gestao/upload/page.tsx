'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Loader2,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GestaoUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    const uploadToast = toast.loading('Processando planilha...');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
        toast.success('Upload concluído!', { id: uploadToast });
      } else {
        toast.error(data.error || 'Erro no upload', { id: uploadToast });
      }
    } catch {
      toast.error('Erro de conexão', { id: uploadToast });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const expectedColumns = [
    'nome', 'cpf', 'rgcin', 'dtnasc', 'sexo', 'tel', 'email',
    'cargo', 'categoria', 'faixa', 'nivel', 'jornada', 'lotacao', 'situacao',
  ];

  return (
    <DashboardLayout variant="gestao">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Upload de Planilha</h1>
        <p className="text-slate-500">Importação em massa de dados de servidores via Excel</p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800 mb-1">Como funciona</p>
          <p className="text-sm text-blue-700 leading-relaxed">
            Faça upload de uma planilha Excel (.xlsx ou .xls) com os dados dos servidores. O sistema é inteligente e detecta as colunas automaticamente. Campos obrigatórios: <strong>nome</strong> e <strong>cpf</strong>. Células vazias são tratadas como campos opcionais.
          </p>
        </div>
      </div>

      {/* Column Reference */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-brand-600" />
          Colunas Esperadas
        </h3>
        <div className="flex flex-wrap gap-2">
          {expectedColumns.map((col) => (
            <span
              key={col}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium ${
                col === 'nome' || col === 'cpf'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {col} {col === 'nome' || col === 'cpf' ? '*' : ''}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">* Campos obrigatórios</p>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-brand-400 hover:bg-brand-50/30 transition-all"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {!file ? (
          <>
            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-2">Arraste sua planilha aqui</p>
            <p className="text-slate-400 text-sm mb-4">ou</p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 cursor-pointer transition-all shadow-lg shadow-brand-600/20">
              <Download className="w-4 h-4" />
              Escolher Arquivo
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </>
        ) : (
          <div className="py-4">
            <FileSpreadsheet className="w-12 h-12 text-brand-500 mx-auto mb-4" />
            <p className="text-slate-800 font-medium">{file.name}</p>
            <p className="text-slate-400 text-sm">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {file && (
        <div className="mt-6 text-center">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-brand text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-lg shadow-brand-600/20 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Processar Planilha
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-brand flex items-center justify-between">
            <h3 className="text-white font-bold">Resultado do Processamento</h3>
            <span className="text-brand-200 text-sm">{result.total} linhas processadas</span>
          </div>

          <div className="p-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{result.created}</p>
                <p className="text-sm text-green-600">Novos</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
                <p className="text-sm text-blue-600">Atualizados</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-700">{result.errors}</p>
                <p className="text-sm text-red-600">Erros</p>
              </div>
            </div>

            {/* Details */}
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-slate-600">Linha</th>
                    <th className="text-left px-4 py-2 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-4 py-2 font-semibold text-slate-600">Mensagem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.details.map((d: any, i: number) => (
                    <tr key={i} className={d.success ? '' : 'bg-red-50/50'}>
                      <td className="px-4 py-2 text-slate-500">Linha {d.row}</td>
                      <td className="px-4 py-2">
                        {d.success ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            {d.message}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            Erro
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {d.success ? '' : d.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
