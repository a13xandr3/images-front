import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { JsonReaderPipe } from '../../../../shared/pipes/json-reader.pipe';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import deleteAccess from '../../../../../../delete-access.json';
import { ImageItem, Images, LoadImagesResponse } from '../../services/images';
@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.html',
  styleUrl: './image-list.scss',
})
export class ImageList implements OnInit, OnDestroy {
  private readonly imagesService = inject(Images);
  private readonly snackbar = inject(SnackbarService);
  protected readonly response = signal<LoadImagesResponse | null>(null);
  protected readonly selectedImage = signal<ImageItem | null>(null);
  protected readonly selectedImages = signal<ImageItem[]>([]);
  protected readonly selectedImageUrl = signal<string | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deletionEnabled = signal(false);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly previewFailed = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly visiblePages = computed(() => {
    const result = this.response();
    if (!result) return [];
    const currentPage = this.currentPage();
    if (result.pages <= 5) {
      return Array.from({ length: result.pages }, (_, index) => index + 1);
    }
    if (currentPage <= 3) return [1, 2, 3];
    if (currentPage >= result.pages - 2) return [result.pages - 2, result.pages - 1, result.pages];
    return [currentPage - 1, currentPage, currentPage + 1];
  });
  protected readonly showLeadingEllipsis = computed(() => (this.visiblePages()[0] ?? 1) > 1);
  protected readonly showTrailingEllipsis = computed(() => {
    const result = this.response();
    const pages = this.visiblePages();

    return !!result && (pages.at(-1) ?? result.pages) < result.pages;
  });
  ngOnInit(): void {
    this.loadImages();
  }
  ngOnDestroy(): void {
    this.revokeSelectedImageUrl();
  }
  protected excluiImagens(images: ImageItem[]): void {
    const rootPath = this.response()?.root_path;
    if (!this.deletionEnabled()) {
      this.snackbar.show('Habilite a exclusão com a senha antes de continuar.', 'error');
      return;
    }
    if (!rootPath || !images.length || this.deleting()) return;

    const selectedOnCurrentPage = images.filter((image) =>
      this.response()?.images.some((currentImage) => currentImage.id === image.id),
    ).length;

    this.deleting.set(true);
    this.imagesService.imageDelete(images, rootPath).subscribe({
      next: () => {
        const quantity = images.length;
        const deletedIds = new Set(images.map((image) => image.id));
        this.selectedImages.update((selected) =>
          selected.filter((image) => !deletedIds.has(image.id)),
        );
        this.snackbar.show(
          quantity === 1
            ? `Imagem "${this.fileName(images[0].path)}" excluída com sucesso.`
            : `${quantity} imagens excluídas com sucesso.`,
          'success',
        );
        const pageAfterDelete =
          selectedOnCurrentPage >= (this.response()?.images.length ?? 0) && this.currentPage() > 1
            ? this.currentPage() - 1
            : this.currentPage();
        this.deleting.set(false);
        this.loadImages(pageAfterDelete);
      },
      error: () => {
        this.deleting.set(false);
        this.selectedImages.set([]);
        this.snackbar.show('Não foi possível concluir a exclusão das imagens selecionadas.', 'error');
        this.loadImages();
      },
    });
  }
  protected habilitarExclusao(
    password: string,
    dialog: HTMLDialogElement,
    input: HTMLInputElement,
  ): void {
    if (password !== deleteAccess.password) {
      this.snackbar.show('Senha inválida.', 'error');
      input.select();
      return;
    }

    this.deletionEnabled.set(true);
    input.value = '';
    dialog.close();
    this.snackbar.show('Exclusão de imagens habilitada.', 'success');
  }
  protected desabilitarExclusao(): void {
    this.deletionEnabled.set(false);
    this.snackbar.show('Exclusão de imagens bloqueada.', 'success');
  }
  protected toggleImageSelection(image: ImageItem, checked: boolean): void {
    this.selectedImages.update((selected) =>
      checked
        ? selected.some((item) => item.id === image.id)
          ? selected
          : [...selected, image]
        : selected.filter((item) => item.id !== image.id),
    );
  }
  protected isImageSelected(image: ImageItem): boolean {
    return this.selectedImages().some((item) => item.id === image.id);
  }
  protected loadImages(page: number = this.currentPage()): void {
    const previousPage = this.currentPage();
    this.currentPage.set(page);
    this.loading.set(true);
    this.errorMessage.set(null);
    this.imagesService.imagesLoad(page).subscribe({
      next: (response) => {
        //console.log('resposta',response);
        this.response.set(response);
        this.currentPage.set(response.page);
        this.selectedImage.set(null);
        this.revokeSelectedImageUrl();
        this.previewFailed.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.currentPage.set(previousPage);
        this.errorMessage.set('Não foi possível carregar os arquivos. Tente novamente.');
        this.loading.set(false);
      },
    });
  }
  protected loadImage(image: ImageItem): void {
    this.selectedImage.set(image);
    this.revokeSelectedImageUrl();
    this.previewFailed.set(false);
    this.errorMessage.set(null);
    this.imagesService.imageLoad(image.id).subscribe({
      next: (imageBlob) => {
        if (this.selectedImage()?.id !== image.id) return;
        this.selectedImageUrl.set(URL.createObjectURL(imageBlob));
        this.previewFailed.set(false);
      },
      error: () => {
        if (this.selectedImage()?.id !== image.id) return;

        this.previewFailed.set(true);
      },
    });
  }
  protected goToPage(page: number): void {
    const totalPages = this.response()?.pages ?? 1;
    const validPage = Math.min(Math.max(page, 1), totalPages);
    if (!this.loading() && validPage !== this.currentPage()) {
      this.loadImages(validPage);
    }
  }
  protected firstPage(): void {
    this.goToPage(1);
  }
  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }
  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }
  protected lastPage(): void {
    this.goToPage(this.response()?.pages ?? 1);
  }
  protected selectImage(image: ImageItem): void {
    this.loadImage(image);
  }
  protected handleItemKeydown(event: KeyboardEvent, currentIndex: number): void {
    const images = this.response()?.images ?? [];
    let targetIndex: number;
    switch (event.key) {
      case 'ArrowDown':
        targetIndex = Math.min(currentIndex + 1, images.length - 1);
        break;
      case 'ArrowUp':
        targetIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = images.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (targetIndex === currentIndex || !images[targetIndex]) return;
    const list = (event.currentTarget as HTMLElement).closest('.file-list');
    const target = list?.querySelectorAll<HTMLButtonElement>('.file-item')[targetIndex];
    target?.focus();
    this.selectImage(images[targetIndex]);
  }
  private revokeSelectedImageUrl(): void {
    const imageUrl = this.selectedImageUrl();
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    this.selectedImageUrl.set(null);
  }
  protected fileName(path: string): string {
    return path.split('/').filter(Boolean).at(-1) ?? path;
  }
  protected formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** unitIndex;
    return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${units[unitIndex]}`;
  }
}
