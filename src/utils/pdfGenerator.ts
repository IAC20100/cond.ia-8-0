import html2pdf from 'html2pdf.js';

const getPdfOptions = (fileName: string, format: string) => ({
  margin: [15, 15, 15, 15] as [number, number, number, number],
  filename: fileName,
  image: { type: 'jpeg' as const, quality: 0.98 },
  html2canvas: { 
    scale: 2, 
    useCORS: true, 
    letterRendering: true,
    backgroundColor: '#ffffff',
    logging: false,
    allowTaint: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1000,
    onclone: (clonedDoc: Document) => {
      // Remove or replace modern color functions that html2canvas cannot parse
      const styles = clonedDoc.getElementsByTagName('style');
      for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        if (style.innerHTML.includes('oklch') || style.innerHTML.includes('oklab') || style.innerHTML.includes('color-mix')) {
          style.innerHTML = style.innerHTML
            .replace(/(oklch|oklab|color-mix)\([^;}]+\)/g, '#000000');
        }
      }
      
      // Also check inline styles and remove problematic variables
      const elements = clonedDoc.getElementsByTagName('*');
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        if (el.style) {
          const propsToRemove = [];
          for (let j = 0; j < el.style.length; j++) {
            const prop = el.style[j];
            if (prop.startsWith('--tw-')) {
              propsToRemove.push(prop);
            }
          }
          propsToRemove.forEach(prop => el.style.removeProperty(prop));
          
          if (el.style.color?.includes('okl') || el.style.color?.includes('color-mix')) el.style.color = '#000000';
          if (el.style.backgroundColor?.includes('okl') || el.style.backgroundColor?.includes('color-mix')) el.style.backgroundColor = '#ffffff';
          if (el.style.borderColor?.includes('okl') || el.style.borderColor?.includes('color-mix')) el.style.borderColor = '#000000';
        }
        
        // Force page break inside avoid for headers to keep them with content
        if (el.tagName.match(/^H[1-6]$/)) {
          el.style.pageBreakInside = 'avoid';
          el.style.breakInside = 'avoid';
        }
      }
    }
  },
  jsPDF: { 
    unit: 'mm', 
    format: format, 
    orientation: 'portrait' as const,
    compress: true,
    precision: 16
  },
  pagebreak: { 
    mode: ['css', 'legacy'],
    before: ['.page-break-before-always'],
    after: ['.page-break-after-always'],
    avoid: ['.break-inside-avoid', '.page-break-inside-avoid', 'tr', '.no-break', 'img', 'table', 'h1', 'h2', 'h3', 'h4', 'h5']
  }
});

const prepareImages = async (element: HTMLElement) => {
  const images = Array.from(element.getElementsByTagName('img'));
  await Promise.all(images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }));
  await new Promise(resolve => setTimeout(resolve, 1500));
};

export async function generatePdf(element: HTMLElement, fileName: string, format: string = 'a4') {
  if (!element) {
    throw new Error('Elemento para geração do PDF não foi fornecido.');
  }
  
  try {
    console.log(`Iniciando geração de PDF (Motor: html2pdf.js, Formato: ${format}) para:`, fileName);
    
    await prepareImages(element);

    const opt = getPdfOptions(fileName, format);

    // Usando html2pdf para gerar o PDF respeitando quebras de página
    // Geramos como Blob para ter mais controle sobre o download e evitar extensão .bin
    const worker = html2pdf().set(opt).from(element);
    const pdfBlob = await worker.output('blob');
    
    // Garantir que o Blob tenha o tipo MIME correto
    const blob = new Blob([pdfBlob], { type: 'application/pdf' });
    
    // Criar URL para o Blob
    const url = URL.createObjectURL(blob);
    
    // Criar elemento de link temporário para forçar o download com o nome correto
    const link = document.createElement('a');
    link.href = url;
    
    // Garantir que o nome do arquivo seja seguro e termine com .pdf
    const sanitizedFileName = fileName
      .replace(/[/\\?%*:|"<>]/g, '-') // Remover caracteres inválidos para nomes de arquivo
      .trim();
    
    const finalFileName = sanitizedFileName.toLowerCase().endsWith('.pdf') 
      ? sanitizedFileName 
      : `${sanitizedFileName}.pdf`;
    
    link.download = finalFileName;
    
    // Adicionar ao corpo, clicar e remover
    document.body.appendChild(link);
    link.click();
    
    // Pequeno delay antes de limpar para garantir que o download iniciou
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
    
    console.log(`PDF gerado e download iniciado manualmente: ${finalFileName}`);
    
    // Convert blob to base64 to return
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro crítico na geração do PDF:', error);
    let message = 'Erro desconhecido';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    throw new Error(`Falha na geração do PDF: ${message}`);
  }
}

export async function sharePdf(element: HTMLElement, fileName: string, format: string = 'a4') {
  if (!element) {
    throw new Error('Elemento para geração do PDF não foi fornecido.');
  }

  try {
    console.log(`Iniciando geração de PDF para compartilhamento:`, fileName);
    
    await prepareImages(element);

    const opt = getPdfOptions(fileName, format);

    const worker = html2pdf().set(opt).from(element);
    const pdfBlob = await worker.output('blob');
    
    const sanitizedFileName = fileName
      .replace(/[/\\?%*:|"<>]/g, '-')
      .trim();
    
    const finalFileName = sanitizedFileName.toLowerCase().endsWith('.pdf') 
      ? sanitizedFileName 
      : `${sanitizedFileName}.pdf`;

    const file = new File([pdfBlob], finalFileName, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: finalFileName,
        text: `Documento: ${finalFileName}`
      });
      return true;
    } else {
      // Fallback para download se não puder compartilhar
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 200);
      throw new Error('Compartilhamento não suportado neste navegador. O arquivo foi baixado em vez disso.');
    }
  } catch (error) {
    console.error('Erro ao compartilhar PDF:', error);
    throw error;
  }
}

export async function printPdf(element: HTMLElement, fileName: string = 'document', format: string = 'a4') {
  if (!element) {
    throw new Error('Elemento para impressão não foi fornecido.');
  }

  try {
    console.log(`Iniciando geração de PDF para impressão:`, fileName);
    
    await prepareImages(element);

    const opt = getPdfOptions(fileName, format);

    const worker = html2pdf().set(opt).from(element);
    const pdfBlob = await worker.output('blob');
    
    const blob = new Blob([pdfBlob], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    
    document.body.appendChild(iframe);
    
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Limpar após um tempo para garantir que a janela de impressão abriu
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 10000);
      }, 500);
    };
    
    return true;
  } catch (error) {
    console.error('Erro ao imprimir PDF:', error);
    throw error;
  }
}
