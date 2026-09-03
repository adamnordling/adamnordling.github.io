/**
 * Modern In-Browser Client-Side Media & File Converter Engine
 * Features: Batch conversion, Real-time Before/After Split Comparison,
 * Binary PDF generator, ICO generator, Progress dispatching, and Clipboard paste.
 */

class MediaConverter {
    constructor() {
        this.files = [];
        this.targetFormat = 'webp';
        this.quality = 0.88;
        this.scale = 1.0;
        this.activeCompareItem = null;

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
        this.queueContainer = document.getElementById('converter-queue');
        this.convertAllBtn = document.getElementById('btn-convert-all');
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
            this.fileInput.value = ''; // Reset input to allow selecting the same file again
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

        // 3. Settings controls
        // Updated: The disabled rules and opacity toggles have been removed
        // Inside bindEvents() in converter.js:
        this.formatSelect.addEventListener('change', e => {
            this.targetFormat = e.target.value;
            const qualityLabel = document.querySelector('.setting-label-quality');
            const qualityPresetSub = document.getElementById('quality-preset-subtitle');

            if (this.targetFormat === 'png') {
                if (qualityLabel) {
                    qualityLabel.innerHTML = `
                <span lang="en">Color Quantization (PNG)</span>
                <span lang="sv">Färgkvantisering (PNG)</span>
            `;
                }
                if (qualityPresetSub) {
                    qualityPresetSub.textContent = 'PNG is lossless: slider reduces color palette to save size';
                }
            } else {
                if (qualityLabel) {
                    qualityLabel.innerHTML = `
                <span lang="en">Quality</span>
                <span lang="sv">Kvalitet</span>
            `;
                }
                if (qualityPresetSub) {
                    qualityPresetSub.textContent = '● Balanced (80%) recommended';
                }
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

            // Live update comparison modal if open
            if (this.compareModal?.classList.contains('is-open') && this.activeCompareItem) {
                this.convertSingleFile(this.activeCompareItem).then(() => {
                    this.compareConvertedImg.src = this.activeCompareItem.convertedUrl;
                    this.compareTagAfter.textContent = `${this.targetFormat.toUpperCase()}: ${this.formatBytes(this.activeCompareItem.convertedSize)}`;
                });
            }
        });

        this.scaleSelect.addEventListener('change', e => {
            this.scale = parseFloat(e.target.value);
        });

        // New: Listeners that change the button text to allow re-conversion
        [this.formatSelect, this.qualitySlider, this.scaleSelect].forEach(control => {
            // Note: 'change' event works better for dropdown select elements
            const eventType = control === this.qualitySlider ? 'input' : 'change';

            control.addEventListener(eventType, () => {
                this.convertAllBtn.innerHTML =
                    '<span lang="en">Convert / Re-convert All</span><span lang="sv">Konvertera om alla</span>';
            });
        });

        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.convertAllBtn.addEventListener('click', () => this.convertAll());

        // 4. Comparison Modal Close
        if (this.compareClose) {
            this.compareClose.addEventListener('click', () => this.closeCompareModal());
        }
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
        for (const file of Array.from(fileList)) {
            const previewUrl = await this.generateReliablePreview(file);
            const fileObj = {
                id: Math.random().toString(36).substring(2, 9),
                file: file,
                name: file.name,
                size: file.size,
                previewUrl: previewUrl,
                status: 'idle', // 'idle' | 'converting' | 'done' | 'error'
                progress: 0,
                convertedBlob: null,
                convertedUrl: null,
                convertedSize: null
            };
            this.files.push(fileObj);
        }

        this.renderQueue();
    }

    generateReliablePreview(file) {
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
                        <span class="queue-meta-saved" style="color: ${isSmaller ? '#10b981' : '#f59e0b'}">
                            (${isSmaller ? '' : '+'}${diffPercent}%)
                        </span>
                    `;
                }

                return `
                <div class="queue-card" id="card-${item.id}">
                    <div class="queue-progress-bar" id="prog-${item.id}" style="width: ${item.progress}%;"></div>
                    
                    <div class="queue-preview-wrapper" data-id="${item.id}" title="Click to Compare / Preview">
                        <img src="${item.previewUrl}" alt="Thumbnail" class="queue-preview" />
                        <div class="queue-preview-badge">VIEW</div>
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
                <button type="button" class="btn-single-convert btn-reconvert" data-id="${item.id}" title="Re-convert with new settings">
                    <span>↺ Re-convert</span>
                </button>
                <button type="button" class="btn-compare-single" data-id="${item.id}">
                    <span>🔍 Compare</span>
                </button>
                <a href="${item.convertedUrl}" download="${newFilename}" class="btn-download-single">
                    <span>⬇ Download</span>
                </a>
              `
            : `
                <button type="button" class="btn-convert-all btn-single-convert" data-id="${item.id}">
                    <span>Convert</span>
                </button>
              `
    }
    <button type="button" class="btn-remove-single" data-id="${item.id}" title="Remove file">✕</button>
</div>
                </div>
            `;
            })
            .join('');

        this.bindQueueItemEvents();
    }

    bindQueueItemEvents() {
        // Remove button
        this.queueContainer.querySelectorAll('.btn-remove-single').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.currentTarget.getAttribute('data-id');
                this.files = this.files.filter(f => f.id !== id);
                this.renderQueue();
            });
        });

        // Single Convert button
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

        // Compare modal triggers (Thumbnail or Compare button)
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

    // 1. Quantize PNG image data for real client-side PNG file size reduction
    quantizeCanvas(ctx, width, height, quality) {
        if (quality >= 0.95) return; // Keep original 32-bit depth if near 100%

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        // Step size based on quality (lower quality = fewer color bands)
        const step = Math.max(1, Math.round((1 - quality) * 32));

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.floor(data[i] / step) * step; // Red
            data[i + 1] = Math.floor(data[i + 1] / step) * step; // Green
            data[i + 2] = Math.floor(data[i + 2] / step) * step; // Blue
        }
        ctx.putImageData(imgData, 0, 0);
    }

    async loadImageElement(item) {
        if (item.file.type === 'application/pdf' || item.name.endsWith('.pdf')) {
            return this.renderPdfToImage(item.file);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to decode image data'));
            img.src = item.previewUrl;
        });
    }

    // PDF.js dynamic rasterizer for client-side PDF-to-Image decoding
    async renderPdfToImage(pdfFile) {
        if (!window.pdfjsLib) {
            await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
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

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.naturalWidth * this.scale));
            canvas.height = Math.max(1, Math.round(img.naturalHeight * this.scale));
            const ctx = canvas.getContext('2d');

            // Solid background for JPEG / BMP
            if (['jpeg', 'jpg', 'bmp'].includes(this.targetFormat)) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Apply PNG quality compression via quantization
            if (this.targetFormat === 'png') {
                this.quantizeCanvas(ctx, canvas.width, canvas.height, this.quality);
            }

            this.updateProgress(item.id, 75);

            let blob;
            if (this.targetFormat === 'pdf') {
                blob = await this.generateStandardPdf(canvas, this.quality);
            } else if (this.targetFormat === 'ico') {
                blob = await this.generateIcoBlob(canvas);
            } else {
                const mimeType = this.getMimeType(this.targetFormat);
                blob = await new Promise(res => canvas.toBlob(res, mimeType, this.quality));
            }

            if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
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

    /**
     * Creates a genuine, standard single-page PDF document stream in pure JS
     */
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

        // Combine into Uint8Array Blob
        const binaryBuffer = new Uint8Array(pdfParts.reduce((acc, part) => acc + part.length, 0));
        let offset = 0;
        for (const part of pdfParts) {
            for (let i = 0; i < part.length; i++) {
                binaryBuffer[offset++] = part.charCodeAt(i) & 0xff;
            }
        }

        return new Blob([binaryBuffer], { type: 'application/pdf' });
    }

    /**
     * Creates a genuine Windows Icon (.ico) file with standard icon header
     */
    async generateIcoBlob(canvas) {
        const icoCanvas = document.createElement('canvas');
        icoCanvas.width = 64;
        icoCanvas.height = 64;
        const ctx = icoCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, 64, 64);

        const pngBlob = await new Promise(r => icoCanvas.toBlob(r, 'image/png'));
        const pngBuffer = new Uint8Array(await pngBlob.arrayBuffer());

        const icoHeader = new Uint8Array(22);
        // ICONDIR header: Reserved (0), Type (1 for ICO), Image count (1)
        icoHeader[2] = 1;
        icoHeader[4] = 1;

        // ICONDIRENTRY: Width (64), Height (64), Colors (0), Reserved (0), Planes (1), BitCount (32)
        icoHeader[6] = 64;
        icoHeader[7] = 64;
        icoHeader[10] = 1;
        icoHeader[12] = 32;

        // Size of image data
        const size = pngBuffer.length;
        icoHeader[14] = size & 0xff;
        icoHeader[15] = (size >> 8) & 0xff;
        icoHeader[16] = (size >> 16) & 0xff;
        icoHeader[17] = (size >> 24) & 0xff;

        // Offset to image data (22 bytes)
        icoHeader[18] = 22;

        const completeIco = new Uint8Array(22 + size);
        completeIco.set(icoHeader, 0);
        completeIco.set(pngBuffer, 22);

        return new Blob([completeIco], { type: 'image/x-icon' });
    }

    async convertAll() {
        this.convertAllBtn.disabled = true;
        this.convertAllBtn.textContent = 'Converting...';

        for (const fileItem of this.files) {
            if (fileItem.status !== 'done') {
                await this.convertSingleFile(fileItem);
                this.renderQueue();
            }
        }

        this.convertAllBtn.disabled = false;
        this.convertAllBtn.textContent = 'Convert All';
    }

    clearAll() {
        this.files.forEach(f => {
            if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
        });
        this.files = [];
        this.renderQueue();
    }

    // =========================================================================
    // BEFORE / AFTER SPLIT COMPARISON SLIDER CONTROLLER
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
        this.compareInfo.textContent = `Quality: ${Math.round(this.quality * 100)}% · Scale: ${this.scale}x · Difference: ${pct <= 0 ? '' : '+'}${pct}%`;

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
