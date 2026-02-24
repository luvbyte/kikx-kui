<template>
  <div
    @click.self="handleClose"
    class="fscreen flex flex-col justify-between text-white"
  >
    <!-- Top bar -->
    <Transition name="slide-down" mode="out-in">
      <div
        v-if="loaded"
        :key="currentPathVirtual"
        class="flex flex-col gap-2 items-center bg-black/40 p-2 py-4 shadow-lg"
      >
        <div class="flex gap-2 items-center w-full">
          <!-- Path selector -->
          <select
            v-model="currentPathVirtual"
            @change="handlePathChange"
            class="p-1 bg-transparent border rounded"
          >
            <option
              v-for="path in imagePaths"
              :key="path.virtual"
              :value="path.virtual"
            >
              {{ path.name }}
            </option>
          </select>

          <!-- URL input -->
          <input
            v-model="customUrl"
            placeholder="Image url"
            class="input input-sm bg-transparent border-white focus:outline-none"
          />

          <button @click="setBackgroundCustomUrl" class="btn btn-sm w-16">
            SET
          </button>
        </div>
        <!-- Upload / Delete -->
        <div
          v-if="currentPath.canUpdate"
          class="flex p-2 justify-center items-center gap-2"
        >
          <label class="w-24 btn btn-sm cursor-pointer rounded-lg">
            UPLOAD
            <input
              type="file"
              hidden
              accept="image/*"
              @change="handleImageUpload"
            />
          </label>

          <button
            @click="handleDeleteSelectedImage"
            class="w-24 btn btn-sm btn-error rounded-lg"
          >
            DELETE
          </button>
        </div>
        <div v-if="error" class="badge badge-error text-sm">{{ error }}</div>
      </div>
    </Transition>

    <!-- Bottom image panel -->
    <Transition name="slide-up" mode="out-in">
      <div v-if="loaded" :key="currentPathVirtual" class="bg-black/40 p-2 py-4">
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          <div
            v-for="img in images"
            :key="img"
            class="flex-none w-32 aspect-[9/16]"
          >
            <img
              :src="getImageUrl(img)"
              @click="selectImage(img)"
              class="w-full h-full object-cover rounded cursor-pointer border-2 transition"
              :class="
                selectedImage === img
                  ? 'border-white/80'
                  : 'border-white/20 hover:border-blue-400'
              "
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from "vue";

  import { getImageUrl, defaultBackground } from "@/kikx/config";

  import { getFS, muiConfig } from "@/kikx";

  import { useUIConfig } from "@/stores/kikx";

  const props = defineProps(["close"]);

  const fs = getFS();

  const uiConfig = useUIConfig();

  const loaded = ref(false);
  const images = ref([]);
  const selectedImage = ref(null);
  const customUrl = ref("");
  const error = ref("");

  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];

  const imagePaths = reactive([
    {
      name: "SHARE",
      virtual: "share://images/bg",
      url: "/share/images/bg",
      canUpdate: false
    },
    {
      name: "LOCAL",
      virtual: "home://share/images/bg",
      url: "/files/images/bg",
      canUpdate: true
    }
  ]);

  const currentPathVirtual = ref(imagePaths[0].virtual);

  const currentPath = computed(() =>
    imagePaths.find(p => p.virtual === currentPathVirtual.value)
  );

  const basePath = computed(() =>
    currentPath.value.url.endsWith("/")
      ? currentPath.value.url
      : currentPath.value.url + "/"
  );

  // Render Images
  async function renderImages() {
    error.value = "";
    images.value = [];

    const { virtual } = currentPath.value;

    await fs.createDirectory(virtual);
    const res = await fs.listFiles(virtual);

    if (res.error) {
      error.value = res.message || "Failed to load images.";
      return;
    }

    images.value = res.data
      .filter(
        file =>
          !file.directory && imageExtensions.includes(file.suffix.toLowerCase())
      )
      .map(file => basePath.value + file.name);
  }

  // Select Image
  function selectImage(src) {
    selectedImage.value = src;
    uiConfig.state.bg = src;
  }

  // Delete Image
  async function handleDeleteSelectedImage() {
    error.value = "";
  
    if (!currentPath.value.canUpdate) return;
    if (!selectedImage.value) {
      error.value = "No image selected.";
      return;
    }

    const fileName = selectedImage.value.replace(basePath.value, "");
    const fullPath = `${currentPath.value.virtual}/${fileName}`;

    const res = await fs.deleteFile(fullPath);
    if (res.error) {
      error.value = res.message || "Delete failed.";
      return;
    }

    images.value = images.value.filter(i => i !== selectedImage.value);
    selectImage(defaultBackground);
  }

  // Upload Image
  async function handleImageUpload(event) {
    error.value = "";
  
    if (!currentPath.value.canUpdate) return;

    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error.value = "Only image files allowed.";
      return;
    }

    const ext = file.name.substring(file.name.lastIndexOf("."));
    const randomId = Math.random().toString(36).substring(2, 10);
    const newFileName = `${randomId}${ext}`;
    const fullVirtualPath = `${currentPath.value.virtual}/${newFileName}`;

    const renamedFile = new File([file], fullVirtualPath, {
      type: file.type
    });

    const res = await fs.uploadFile(renamedFile);
    if (res.error) {
      error.value = res.message || "Upload failed.";
      return;
    }

    const imageUrl = basePath.value + newFileName;
    images.value.unshift(imageUrl);
    selectImage(imageUrl);
  }

  // Custum URL
  function setBackgroundCustomUrl() {
    error.value = "";
  
    if (customUrl.value.length <= 0) return;

    const test = new Image();
    test.onload = () => {
      images.value.unshift(customUrl.value);
      selectImage(customUrl.value);
      customUrl.value = "";
    };
    test.onerror = () => {
      error.value = "Failed to load image.";
    };

    test.src = customUrl.value;
  }

  // Utils
  async function handlePathChange() {
    await renderImages();
  }
  function handleClose() {
    // since state watches and auto saves no need
    // if (selectedImage.value) {
    // await muiConfig.save();
    // }
    props.close();
  }

  onMounted(async () => {
    setTimeout(() => (loaded.value = true), 300);
    await renderImages();
  });
</script>
