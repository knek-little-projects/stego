<template>
  <input type="file" ref="file" @change="change" />
</template>
<script>
export default {
  props: ["value"],
  methods: {
    change() {
      const file = this.$refs.file.files[0];
      if (!file) {
        this.$emit("input", null);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          file.bytes = new Uint8Array(reader.result);
          this.$emit("input", file);
        };
        reader.readAsArrayBuffer(file);
      }
    },
  },
};
</script>