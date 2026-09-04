/**
 * Modern In-Browser Client-Side Media & File Converter Engine
 * Features: AVIF, HEIC, WebP, PNG, JPEG, ICO, BMP, PDF, ZIP Batch Download,
 * 8K Pixel-Bomb Guard, EXIF Sanitization, Custom Dimensions & Memory Cleanup.
 */

class MediaConverter {
    constructor() {
        this.files = [];
        this.targetFormat = 'webp';
        this.quality = 0.88;
        this.scale = 1.0;
        this.bgMode = 'transparent';
        this.customWidth = null;
        this.customHeight = null;
        this.activeCompareItem = null;

        // Safety Guardrails
        this.MAX_FILE_SIZE_MB = 50;
        this.MAX_BATCH_FILES = 25;
        this.MAX_CANVAS_DIMENSION = 8192; // 8K Pixel-bomb protection

        this.initDOMElements();
        this.bindEvents();
        this.initComparisonSlider();
    }

    initDOMElements() {
        this.dropzone = document.getElementById('converter-dropzone');
        this.fileInput = document.getElementById('converter-file-input');
        this.formatSelect = document.getElementById('converter-format');
        this.qualitySlider = document.getElementById('converter-quality');
        this.qualityVal = document.getElementById('converter-quality-val');
        this.scaleSelect = document.getElementById('converter-scale');
        this.customDimRow = document.getElementById('custom-dim-row');
        this.customWidthInput = document.getElementById('custom-width');
        this.customHeightInput = document.getElementById('custom-height');
        this.queueContainer = document.getElementById('converter-queue');
        this.convertAllBtn = document.getElementById('btn-convert-all');
        this.zipAllBtn = document.getElementById('btn-zip-all');
        this.clearAllBtn = document.getElementById('btn-clear-all');
        this.batchCount = document.getElementById('converter-batch-count');

        // Comparison Modal Elements
        this.compareModal = document.getElementById('compare-modal');
        this.compareClose = document.getElementById('compare-close');
        this.compareOriginalImg = document.getElementById('compare-img-original');
        this.compareConvertedImg = document.getElementById('compare-img-converted');
        this.compareLayerAfter = document.getElementById('compare-layer-after');
        this.compareHandle = document.getElementById('compare-handle-line');
        this.compareFrame = document.getElementById('compare-viewer-frame');
        this.compareTagBefore = document.getElementById('compare-tag-before');
        this.compareTagAfter = document.getElementById('compare-tag-after');
        this.compareInfo = document.getElementById('compare-footer-info');
    }

    bindEvents() {
        if (!this.dropzone) return;

        // 1. File Input & Drag-and-Drop
        this.fileInput.addEventListener('change', e => {
            this.handleFiles(e.target.files);
            this.fileInput.value = '';
        });

        ['dragenter', 'dragover'].forEach(name => {
            this.dropzone.addEventListener(name, e => {
                e.preventDefault();
                e.stopPropagation();
                this.dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(name => {
            this.dropzone.addEventListener(name, e => {
                e.preventDefault();
                e.stopPropagation();
                this.dropzone.classList.remove('dragover');
            });
        });

        this.dropzone.addEventListener('drop', e => {
            if (e.dataTransfer?.files?.length) {
                this.handleFiles(e.dataTransfer.files);
            }
        });

        // 2. Clipboard Paste (Ctrl+V)
        document.addEventListener('paste', e => {
            const toolView = document.getElementById('tool-view');
            if (toolView && toolView.style.display !== 'none' && e.clipboardData?.files?.length) {
                this.handleFiles(e.clipboardData.files);
            }
        });

        // 3. Settings Controls
        this.formatSelect.addEventListener('change', e => {
            this.targetFormat = e.target.value;
            const qualityLabel = document.querySelector('.setting-label-quality');
            const qualityPresetSub = document.getElementById('quality-preset-subtitle');

            if (this.targetFormat === 'pdf') {
                this.qualitySlider.disabled = true;
                this.qualitySlider.style.opacity = '0.35';
                this.qualitySlider.style.cursor = 'not-allowed';
                this.qualityVal.textContent = '100% (Lossless)';
                if (qualityPresetSub) qualityPresetSub.textContent = 'PDF creates a clean vector document wrapper';
            } else if (this.targetFormat === 'png') {
                this.qualitySlider.disabled = false;
                this.qualitySlider.style.opacity = '1';
                this.qualitySlider.style.cursor = 'pointer';
                if (qualityLabel) {
                    qualityLabel.innerHTML = `<span lang="en">Color Quantization (PNG)</span><span lang="sv">Färgkvantisering (PNG)</span>`;
                }
                if (qualityPresetSub)
                    qualityPresetSub.textContent = 'PNG is lossless: slider reduces color palette to save size';
            } else {
                this.qualitySlider.disabled = false;
                this.qualitySlider.style.opacity = '1';
                this.qualitySlider.style.cursor = 'pointer';
                if (qualityLabel) {
                    qualityLabel.innerHTML = `<span lang="en">Quality</span><span lang="sv">Kvalitet</span>`;
                }
                if (qualityPresetSub) qualityPresetSub.textContent = '● Balanced (80%) recommended';
            }
        });

        this.qualitySlider.addEventListener('input', e => {
            this.quality = parseFloat(e.target.value);
            const pct = Math.round(this.quality * 100);
            let label = `${pct}%`;
            if (pct === 80) label += ' (Recommended)';
            else if (pct <= 35) label += ' (Max Compression)';
            else if (pct >= 95) label += ' (High Quality)';
            this.qualityVal.textContent = label;

            if (this.compareModal?.classList.contains('is-open') && this.activeCompareItem) {
                this.convertSingleFile(this.activeCompareItem).then(() => {
                    this.compareConvertedImg.src = this.activeCompareItem.convertedUrl;
                    this.compareTagAfter.textContent = `${this.targetFormat.toUpperCase()}: ${this.formatBytes(this.activeCompareItem.convertedSize)}`;
                });
            }
        });

        this.scaleSelect.addEventListener('change', e => {
            if (e.target.value === 'custom') {
                this.customDimRow.style.display = 'flex';
                this.scale = 'custom';
            } else {
                this.customDimRow.style.display = 'none';
                this.scale = parseFloat(e.target.value);
            }
        });

        this.customWidthInput.addEventListener('input', e => {
            this.customWidth = parseInt(e.target.value, 10) || null;
        });

        this.customHeightInput.addEventListener('input', e => {
            this.customHeight = parseInt(e.target.value, 10) || null;
        });

        // Trigger re-convert text on settings changes
        [this.formatSelect, this.qualitySlider, this.scaleSelect].forEach(control => {
            const eventType = control === this.qualitySlider ? 'input' : 'change';
            control.addEventListener(eventType, () => {
                this.convertAllBtn.innerHTML =
                    '<span lang="en">Convert / Re-convert All</span><span lang="sv">Konvertera om alla</span>';
            });
        });

        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.convertAllBtn.addEventListener('click', () => this.convertAll());
        this.zipAllBtn.addEventListener('click', () => this.downloadAllAsZip());

        // 4. Comparison Modal Close
        if (this.compareClose) this.compareClose.addEventListener('click', () => this.closeCompareModal());
        if (this.compareModal) {
            this.compareModal.addEventListener('click', e => {
                if (e.target === this.compareModal) this.closeCompareModal();
            });
        }
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.compareModal?.classList.contains('is-open')) {
                this.closeCompareModal();
            }
        });
    }

    async handleFiles(fileList) {
        const incomingFiles = Array.from(fileList);

        if (this.files.length + incomingFiles.length > this.MAX_BATCH_FILES) {
            alert(`Maximum ${this.MAX_BATCH_FILES} files allowed at once.`);
            return;
        }

        for (const file of incomingFiles) {
            if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
                alert(
                    `"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max is ${this.MAX_FILE_SIZE_MB} MB.`
                );
                continue;
            }

            const previewUrl = await this.generateReliablePreview(file);
            const fileObj = {
                id: Math.random().toString(36).substring(2, 9),
                file: file,
                name: file.name,
                size: file.size,
                previewUrl: previewUrl,
                status: 'idle',
                progress: 0,
                convertedBlob: null,
                convertedUrl: null,
                convertedSize: null
            };
            this.files.push(fileObj);
        }

        this.renderQueue();
    }

    async generateReliablePreview(file) {
        const ext = file.name.toLowerCase();

        // 1. PDF Preview
        if (file.type === 'application/pdf' || ext.endsWith('.pdf')) {
            const fallbackSvg =
                'data:image/svg+xml;base64,' +
                btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
            `);
            try {
                const img = await this.renderPdfToImage(file);
                return img.src;
            } catch {
                return fallbackSvg;
            }
        }

        // 2. iPhone HEIC / HEIF Preview
        if (ext.endsWith('.heic') || ext.endsWith('.heif')) {
            try {
                const jpegBlob = await this.convertHeicToBlob(file);
                return URL.createObjectURL(jpegBlob);
            } catch {
                return URL.createObjectURL(file);
            }
        }

        // 3. Standard Images
        return new Promise(resolve => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = () => resolve(URL.createObjectURL(file));
                reader.readAsDataURL(file);
            } else {
                resolve(URL.createObjectURL(file));
            }
        });
    }

    async convertHeicToBlob(file) {
        if (!window.heic2any) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        const converted = await window.heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
        return Array.isArray(converted) ? converted[0] : converted;
    }

    formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    renderQueue() {
        this.batchCount.textContent = `${this.files.length} file${this.files.length === 1 ? '' : 's'}`;
        this.convertAllBtn.disabled = this.files.length === 0;

        const hasConverted = this.files.some(f => f.status === 'done' && f.convertedBlob);
        this.zipAllBtn.disabled = !hasConverted;

        if (this.files.length === 0) {
            this.queueContainer.innerHTML = '';
            return;
        }

        this.queueContainer.innerHTML = this.files
            .map(item => {
                const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
                const ext = this.targetFormat;
                const newFilename = `${baseName}.${ext}`;

                let resultMeta = '';
                if (item.status === 'done' && item.convertedSize) {
                    const diff = item.convertedSize - item.size;
                    const diffPercent = Math.round((diff / item.size) * 100);
                    const isSmaller = diff <= 0;
                    resultMeta = `
                <span>→</span>
                <span class="queue-meta-pill">${this.formatBytes(item.convertedSize)}</span>
                <span class="queue-meta-saved" style="color: ${isSmaller ? 'var(--accent)' : '#f59e0b'}">
                    (${isSmaller ? '' : '+'}${diffPercent}%)
                </span>
            `;
                }

                return `
        <div class="queue-card" id="card-${item.id}">
            <div class="queue-progress-bar" id="prog-${item.id}" style="width: ${item.progress}%;"></div>
            
            <div class="queue-preview-wrapper" data-id="${item.id}" title="Click to Compare / Preview">
                <img src="${item.previewUrl}" alt="Thumbnail" class="queue-preview" />
            </div>

            <div class="queue-details">
                <span class="queue-filename" title="${item.name}">${item.name}</span>
                <div class="queue-meta">
                    <span class="queue-meta-pill">${this.formatBytes(item.size)}</span>
                    ${resultMeta}
                </div>
            </div>

            <div class="queue-actions">
                ${
                    item.status === 'done'
                        ? `
                            <button type="button" class="btn-reconvert btn-single-convert" data-id="${item.id}" title="Re-convert">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                <span lang="en">Re-convert</span>
                                <span lang="sv">Konvertera om</span>
                            </button>
                            <button type="button" class="btn-compare-single" data-id="${item.id}">
                                <span lang="en">Compare</span>
                                <span lang="sv">Jämför</span>
                            </button>
                            <a href="${item.convertedUrl}" download="${newFilename}" class="btn-download-single">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                <span lang="en">Download</span>
                                <span lang="sv">Ladda ner</span>
                            </a>
                          `
                        : `
                            <button type="button" class="btn-single-convert" data-id="${item.id}">
                                <span lang="en">Convert</span>
                                <span lang="sv">Konvertera</span>
                            </button>
                          `
                }
                <button type="button" class="btn-remove-single" data-id="${item.id}" aria-label="Remove">✕</button>
            </div>
        </div>
        `;
            })
            .join('');

        this.bindQueueItemEvents();
    }

    bindQueueItemEvents() {
        this.queueContainer.querySelectorAll('.btn-remove-single').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.currentTarget.getAttribute('data-id');
                const fileItem = this.files.find(f => f.id === id);
                if (fileItem?.convertedUrl) URL.revokeObjectURL(fileItem.convertedUrl);
                this.files = this.files.filter(f => f.id !== id);
                this.renderQueue();
            });
        });

        this.queueContainer.querySelectorAll('.btn-single-convert').forEach(btn => {
            btn.addEventListener('click', async e => {
                const id = e.currentTarget.getAttribute('data-id');
                const fileItem = this.files.find(f => f.id === id);
                if (fileItem) {
                    await this.convertSingleFile(fileItem);
                    this.renderQueue();
                }
            });
        });

        this.queueContainer.querySelectorAll('.queue-preview-wrapper, .btn-compare-single').forEach(el => {
            el.addEventListener('click', e => {
                const id = e.currentTarget.getAttribute('data-id');
                const fileItem = this.files.find(f => f.id === id);
                if (fileItem) {
                    this.openCompareModal(fileItem);
                }
            });
        });
    }

    quantizeCanvas(ctx, width, height, quality) {
        if (quality >= 0.95) return;
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const step = Math.max(1, Math.round((1 - quality) * 32));

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.floor(data[i] / step) * step;
            data[i + 1] = Math.floor(data[i + 1] / step) * step;
            data[i + 2] = Math.floor(data[i + 2] / step) * step;
        }
        ctx.putImageData(imgData, 0, 0);
    }

    async loadImageElement(item) {
        const ext = item.name.toLowerCase();
        if (item.file.type === 'application/pdf' || ext.endsWith('.pdf')) {
            return this.renderPdfToImage(item.file);
        }
        if (ext.endsWith('.heic') || ext.endsWith('.heif')) {
            const jpegBlob = await this.convertHeicToBlob(item.file);
            const img = new Image();
            img.src = URL.createObjectURL(jpegBlob);
            await new Promise(r => (img.onload = r));
            return img;
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to decode image'));
            img.src = item.previewUrl;
        });
    }

    async renderPdfToImage(pdfFile) {
        if (!window.pdfjsLib) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                script.onload = () => {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        const img = new Image();
        img.src = canvas.toDataURL('image/png');
        await new Promise(r => (img.onload = r));
        return img;
    }

    async convertSingleFile(item) {
        item.status = 'converting';
        this.updateProgress(item.id, 25);

        try {
            const img = await this.loadImageElement(item);
            this.updateProgress(item.id, 50);

            // 1. Calculate Target Dimensions & Pixel-Bomb Guard (Max 8K)
            let targetW = img.naturalWidth || img.width;
            let targetH = img.naturalHeight || img.height;

            if (this.scale === 'custom' && this.customWidth) {
                targetW = this.customWidth;
                targetH = this.customHeight || Math.round(targetW * (img.naturalHeight / img.naturalWidth));
            } else if (typeof this.scale === 'number') {
                targetW = Math.round(targetW * this.scale);
                targetH = Math.round(targetH * this.scale);
            }

            // PIXEL-BOMB GUARD: Clamp dimensions to 8192px max to prevent OOM tab crashes
            if (targetW > this.MAX_CANVAS_DIMENSION || targetH > this.MAX_CANVAS_DIMENSION) {
                const ratio = Math.min(this.MAX_CANVAS_DIMENSION / targetW, this.MAX_CANVAS_DIMENSION / targetH);
                targetW = Math.round(targetW * ratio);
                targetH = Math.round(targetH * ratio);
            }

            targetW = Math.max(1, targetW);
            targetH = Math.max(1, targetH);

            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');

            // 2. Transparency handling:
            // JPEG and BMP do not support transparency -> automatically fill with solid white.
            // PNG, WebP, AVIF, and ICO preserve full alpha transparency automatically.
            if (['jpeg', 'jpg', 'bmp'].includes(this.targetFormat)) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Drawing to canvas automatically strips tracking EXIF & GPS metadata
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Apply PNG color quantization if PNG is chosen
            if (this.targetFormat === 'png') {
                this.quantizeCanvas(ctx, canvas.width, canvas.height, this.quality);
            }

            this.updateProgress(item.id, 75);

            let blob;
            if (this.targetFormat === 'pdf') {
                blob = await this.generateStandardPdf(canvas);
            } else if (this.targetFormat === 'ico') {
                blob = await this.generateIcoBlob(canvas);
            } else {
                const mimeType = this.getMimeType(this.targetFormat);
                blob = await new Promise(res => canvas.toBlob(res, mimeType, this.quality));
            }

            // 3. Memory Cleanup of previous object URL
            if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);

            // Free canvas memory buffer
            canvas.width = 0;
            canvas.height = 0;

            item.convertedBlob = blob;
            item.convertedSize = blob.size;
            item.convertedUrl = URL.createObjectURL(blob);
            item.status = 'done';
            this.updateProgress(item.id, 100);
        } catch (err) {
            console.error(err);
            item.status = 'error';
        }
    }

    updateProgress(id, percent) {
        const progEl = document.getElementById(`prog-${id}`);
        if (progEl) progEl.style.width = `${percent}%`;
    }

    getMimeType(format) {
        switch (format) {
            case 'avif':
                return 'image/avif';
            case 'png':
                return 'image/png';
            case 'jpeg':
            case 'jpg':
                return 'image/jpeg';
            case 'webp':
                return 'image/webp';
            case 'bmp':
                return 'image/bmp';
            default:
                return 'image/png';
        }
    }

    async generateStandardPdf(canvas) {
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const base64Data = imgDataUrl.split(',')[1];
        const binaryImg = atob(base64Data);
        const imgLength = binaryImg.length;

        const widthPt = canvas.width * 0.75;
        const heightPt = canvas.height * 0.75;

        const pdfParts = [
            '%PDF-1.4\n',
            '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
            '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
            `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt.toFixed(2)} ${heightPt.toFixed(2)}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
            `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLength} >>\nstream\n${binaryImg}\nendstream\nendobj\n`,
            `5 0 obj\n<< /Length 44 >>\nstream\nq\n${widthPt.toFixed(2)} 0 0 ${heightPt.toFixed(2)} 0 0 cm\n/Im1 Do\nQ\nendstream\nendobj\n`,
            'xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000262 00000 n \n0000000450 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n545\n%%EOF`'
        ];

        const binaryBuffer = new Uint8Array(pdfParts.reduce((acc, part) => acc + part.length, 0));
        let offset = 0;
        for (const part of pdfParts) {
            for (let i = 0; i < part.length; i++) {
                binaryBuffer[offset++] = part.charCodeAt(i) & 0xff;
            }
        }

        return new Blob([binaryBuffer], { type: 'application/pdf' });
    }

    async generateIcoBlob(canvas) {
        const icoCanvas = document.createElement('canvas');
        icoCanvas.width = 64;
        icoCanvas.height = 64;
        const ctx = icoCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, 64, 64);

        const pngBlob = await new Promise(r => icoCanvas.toBlob(r, 'image/png'));
        const pngBuffer = new Uint8Array(await pngBlob.arrayBuffer());

        const icoHeader = new Uint8Array(22);
        icoHeader[2] = 1;
        icoHeader[4] = 1;
        icoHeader[6] = 64;
        icoHeader[7] = 64;
        icoHeader[10] = 1;
        icoHeader[12] = 32;

        const size = pngBuffer.length;
        icoHeader[14] = size & 0xff;
        icoHeader[15] = (size >> 8) & 0xff;
        icoHeader[16] = (size >> 16) & 0xff;
        icoHeader[17] = (size >> 24) & 0xff;
        icoHeader[18] = 22;

        const completeIco = new Uint8Array(22 + size);
        completeIco.set(icoHeader, 0);
        completeIco.set(pngBuffer, 22);

        return new Blob([completeIco], { type: 'image/x-icon' });
    }

    async convertAll() {
        if (this.files.length === 0) return;
        this.convertAllBtn.disabled = true;
        this.convertAllBtn.innerHTML = '<span lang="en">Converting...</span><span lang="sv">Konverterar...</span>';

        for (const fileItem of this.files) {
            await this.convertSingleFile(fileItem);
            this.renderQueue();
        }

        this.convertAllBtn.disabled = false;
        this.convertAllBtn.innerHTML = '<span lang="en">Convert All</span><span lang="sv">Konvertera alla</span>';
    }

    async downloadAllAsZip() {
        const convertedFiles = this.files.filter(f => f.status === 'done' && f.convertedBlob);
        if (convertedFiles.length === 0) return;

        if (!window.JSZip) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const zip = new window.JSZip();
        convertedFiles.forEach(item => {
            const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
            zip.file(`${baseName}.${this.targetFormat}`, item.convertedBlob);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = `converted_files_${Date.now()}.zip`;
        a.click();
        URL.revokeObjectURL(zipUrl);
    }

    clearAll() {
        this.files.forEach(f => {
            if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
        });
        this.files = [];
        this.renderQueue();
    }

    // =========================================================================
    // BEFORE / AFTER SPLIT COMPARISON SLIDER
    // =========================================================================
    async openCompareModal(item) {
        this.activeCompareItem = item;
        if (!item.convertedUrl) {
            await this.convertSingleFile(item);
            this.renderQueue();
        }

        this.compareOriginalImg.src = item.previewUrl;
        this.compareConvertedImg.src = item.convertedUrl;

        this.compareTagBefore.textContent = `Original: ${this.formatBytes(item.size)}`;
        this.compareTagAfter.textContent = `${this.targetFormat.toUpperCase()}: ${this.formatBytes(item.convertedSize)}`;

        const diff = (item.convertedSize || item.size) - item.size;
        const pct = Math.round((diff / item.size) * 100);
        this.compareInfo.textContent = `Quality: ${Math.round(this.quality * 100)}% · Difference: ${pct <= 0 ? '' : '+'}${pct}%`;

        this.setSliderPosition(50);
        this.compareModal.classList.add('is-open');
    }

    closeCompareModal() {
        if (this.compareModal) {
            this.compareModal.classList.remove('is-open');
        }
    }

    initComparisonSlider() {
        if (!this.compareFrame || !this.compareHandle) return;
        let isDragging = false;

        const updatePosition = clientX => {
            const rect = this.compareFrame.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            this.setSliderPosition(percentage);
        };

        const onStart = e => {
            isDragging = true;
            updatePosition(e.touches ? e.touches[0].clientX : e.clientX);
        };
        const onMove = e => {
            if (!isDragging) return;
            updatePosition(e.touches ? e.touches[0].clientX : e.clientX);
        };
        const onEnd = () => {
            isDragging = false;
        };

        this.compareFrame.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        this.compareFrame.addEventListener('touchstart', onStart, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd);
    }

    setSliderPosition(percentage) {
        if (!this.compareHandle || !this.compareLayerAfter) return;
        this.compareHandle.style.left = `${percentage}%`;
        this.compareLayerAfter.style.clipPath = `inset(0 0 0 ${percentage}%)`;
    }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.mediaConverter = new MediaConverter();
});
