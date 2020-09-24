<template>
  <div class="card">
    <h1>Encrypt</h1>

    <label>
      Secret
      <file v-model="secretFile" />
    </label>

    <label>
      Image 1
      <file v-model="image1" />
    </label>

    <label>
      Image 2
      <file v-model="image2" />
    </label>

    <label>
      Password
      <input type="password" autocomplete="off" v-model="password" />
    </label>

    <label>
      Repeat password
      <input type="password" autocomplete="off" v-model="repeatPassword" />
    </label>

    <label>
      Image/secret separator
      <input v-model="sep" />
    </label>

    <b-modal v-model="modal" centered hide-header-close hide-header>
      <template v-if="os1 && os2">
        <h2>Hide this files apart:</h2>
        <ol>
          <li>
            <a :download="image1.name" :href="os1">{{ image1.name }}</a>
          </li>
          <li>
            <a :download="image2.name" :href="os2">{{ image2.name }}</a>
          </li>
        </ol>
      </template>
      <template v-else>
        <h2>Encrypting...</h2>
      </template>

      <template v-slot:modal-footer>
        <b-button variant="danger" @click="halt">Halt</b-button>
      </template>
    </b-modal>

    <div class="footer">
      <button :disabled="disabled" class="go encrypt" @click="encrypt">Encrypt!</button>
    </div>
  </div>
</template>
<script>
import * as bytes from "@/utils/bytes.js";

export default {
  data() {
    return {
      modal: false,
      secretFile: null,
      image1: null,
      image2: null,
      password: null,
      repeatPassword: null,
      os1: null,
      os2: null,
      sep: "===",
    };
  },
  computed: {
    disabled() {
      return (
        !this.secretFile ||
        !this.image1 ||
        !this.image2 ||
        !this.password ||
        !this.sep ||
        this.password !== this.repeatPassword
      );
    },
  },
  methods: {
    encrypt() {
      this.modal = true;
      setTimeout(() => {
        try {
          const [output1, output2] = bytes.hide(
            this.secretFile.bytes,
            this.sep,
            this.password,
            this.image1.bytes,
            this.image2.bytes,
          )

          this.os1 = bytes.bytesToOctetStream(output1);
          this.os2 = bytes.bytesToOctetStream(output2);
        } catch (e) {
          this.modal = false;
          window.alert(e);
          throw e;
        }
      }, 100);
    },
  },
};
</script>