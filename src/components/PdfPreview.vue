<script setup lang="ts">
import PdfPreviewControls from '@/components/PdfPreviewControls.vue'
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { EventBus, PDFFindController, PDFLinkService, PDFViewer } from 'pdfjs-dist/web/pdf_viewer.mjs'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { useDebounceFn } from '@vueuse/core'
import type { IPDFLinkService } from 'pdfjs-dist/types/web/interfaces'

GlobalWorkerOptions.workerSrc = PdfWorker

const props = withDefaults(
  defineProps<{
    // PDF source as URL, Base64, binary (blob/document url)
    pdfSource: string
    // filename for download
    filename?: string
    // search term to highlight
    annotation?: string
  }>(),
  {
    // either URL, Base64, binary, or document proxy
    pdfSource: '',
    filename: 'document.pdf',
    annotation: ''
  }
)

const pdfControls = reactive({
  page: 1,
  pages: 0,
  scale: 'auto',
  // calculated scale after applying "auto"
  customScale: 1.0
})

const eventBus: EventBus = new EventBus()
let pdfViewer: PDFViewer = null
// (Optionally) enable hyperlinks within PDF files.
let pdfLinkService: IPDFLinkService = undefined
// (Optionally) enable find controller.
let pdfFindController: PDFFindController = undefined

onMounted(() => {
  const container = document.getElementById('viewerContainer')

  pdfLinkService = new PDFLinkService({
    eventBus
  })

  pdfFindController = new PDFFindController({
    eventBus,
    linkService: pdfLinkService
  })

  pdfViewer = new PDFViewer({
    container: container,
    eventBus: eventBus,
    linkService: pdfLinkService,
    findController: pdfFindController
  })
  pdfLinkService.setViewer(pdfViewer)

  loadPdf()
})

async function loadPdf() {
  pdfViewer.eventBus.on('pagechanging', (e) => {
    pdfControls.page = e.pageNumber
  })

  eventBus.on('pagesinit', function () {
    // PDF loading completed
    pdfControls.pages = pdfViewer.pagesCount
    // Manually update scale
    onUpdateScale()
    // Search for annotation if provided
    if (props.annotation) onSearch(props.annotation)
  })

  // Loading document.
  const loadingTask = getDocument({
    url: props.pdfSource,
    enableXfa: true
  })
  const pdfDocument = await loadingTask.promise

  // Document loaded, specifying document for the viewer and
  // the (optional) linkService.
  pdfViewer.setDocument(pdfDocument)
  pdfLinkService.setDocument(pdfDocument, null)
}

function onUpdatePage() {
  pdfViewer.scrollPageIntoView({
    pageNumber: pdfControls.page
  })
}

function onUpdateScale() {
  let scale = pdfControls.scale
  if (scale === 'auto') {
    // get the first page "PDFPageView" object
    const view = pdfViewer.getPageView(0)
    const container = document.getElementById('viewerContainer')

    // get the unscaled viewport of the page
    const pageVp = view.pdfPage.getViewport({ scale: 1.0 })

    // + 16 for the page margins of 8px on each side
    scale = pageVp.width / (container.clientWidth + 16)
  }

  pdfControls.customScale = scale
  pdfViewer.currentScaleValue = scale
}

const debounceSearch = useDebounceFn(onSearch, 500)
function onSearch(text: string) {
  pdfViewer.eventBus.dispatch('find', {
    type: 'find',
    query: text,
    caseSensitive: false,
    findPrevious: false,
    phraseSearch: true
  })

  //use pdfFindController to access list of matches
  //console.log(pdfFindController)
}

function onDownload() {
  const anchor = document.createElement('a')
  anchor.href = props.pdfSource
  anchor.download = props.filename
  anchor.click()
}

async function onPrint() {
  //TODO: Implement print functionality
  //consider using print.js
}

onBeforeUnmount(() => {
  if (pdfViewer) {
    pdfViewer.cleanup()
  }
})
</script>

<template>
  <PdfPreviewControls
    v-model:page="pdfControls.page"
    v-model:pages="pdfControls.pages"
    v-model:scale="pdfControls.scale"
    :custom-scale="pdfControls.customScale"
    @update:page="onUpdatePage()"
    @update:scale="onUpdateScale()"
    @update:search="debounceSearch"
    @download="onDownload()"
    @print="onPrint()"
  >
    <template #default>
      <div id="viewer" class="pdfViewer"></div>
    </template>
  </PdfPreviewControls>
</template>

<style lang="scss">
@import 'pdfjs-dist/web/pdf_viewer.css';
</style>
