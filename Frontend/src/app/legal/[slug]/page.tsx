import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import { ChevronLeft, FileText, Shield, Scale } from 'lucide-react';
import Link from 'next/link';

// Configuración de iconos según el slug
const getIcon = (slug: string) => {
  switch (slug) {
    case 'terms': return <Scale className="w-8 h-8 text-white" />;
    case 'privacy': return <Shield className="w-8 h-8 text-white" />;
    case 'eula': return <FileText className="w-8 h-8 text-white" />;
    default: return <FileText className="w-8 h-8 text-white" />;
  }
};

// Configuración de colores según el slug
const getThemeColor = (slug: string) => {
  switch (slug) {
    case 'terms': return 'bg-amber-600';
    case 'privacy': return 'bg-blue-700';
    case 'eula': return 'bg-emerald-700';
    default: return 'bg-gray-700';
  }
};

export default async function LegalDynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const contentPath = path.join(process.cwd(), 'content/legal', `${slug}.md`);

  // Verificar si el archivo existe
  if (!fs.existsSync(contentPath)) {
    notFound();
  }

  // Leer el archivo Markdown
  const fileContent = fs.readFileSync(contentPath, 'utf8');
  const { content, data } = matter(fileContent);

  const themeColor = getThemeColor(slug);
  const icon = getIcon(slug);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Botón de volver */}
      <div className="max-w-3xl mx-auto mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al inicio
        </Link>
      </div>

      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        {/* Header Dinámico */}
        <div className={`${themeColor} p-10 flex items-center space-x-4`}>
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            {icon}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {data.title || slug.toUpperCase()}
            </h1>
            <p className="text-white/80 mt-1 font-medium">Documentación Legal de Kitchy</p>
          </div>
        </div>
        
        {/* Contenido Markdown Renderizado */}
        <div className="p-10 lg:p-16">
          <div className="prose prose-slate prose-amber max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight 
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:border-b prose-h2:pb-2
            prose-p:text-gray-600 prose-p:leading-relaxed
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-hr:my-10">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* Footer del documento */}
          <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2026 Kitchy POS. Todos los derechos reservados.</p>
            <p className="mt-2 sm:mt-0 italic font-medium text-amber-600/60 tracking-widest uppercase text-[10px]">Premium Software</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generar rutas estáticas para mejor rendimiento (SEO)
export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), 'content/legal');
  const files = fs.readdirSync(contentDir);

  return files.map((file) => ({
    slug: file.replace('.md', ''),
  }));
}
