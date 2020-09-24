<template>
  <div class="card">
    <h1>Decrypt</h1>

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
      Image/secret separator
      <input v-model="sep" />
    </label>

    <b-modal v-model="modal" centered hide-header-close hide-header>
      <template v-if="os">
        <h2>Download your secret file:</h2>
        <ul>
          <li>
            <a download="secret" :href="os">Secret</a>
          </li>
        </ul>
      </template>
      <template v-else>
        <h2>Decrypting...</h2>
      </template>

      <template v-slot:modal-footer>
        <b-button variant="danger" @click="halt">Halt</b-button>
      </template>
    </b-modal>

    <div class="footer">
      <button :disabled="disabled" class="go decrypt" @click="decrypt">
        Decrypt!
      </button>
    </div>
  </div>
</template>
<script>
import * as bytes from "@/utils/bytes.js";

export default {
  data() {
    return {
      image1: null,
      image2: null,
      password: null,
      sep: "===",
      os: null,
      modal: false,
    };
  },
  computed: {
    disabled() {
      return !this.image1 || !this.image2 || !this.password || !this.sep;
    },
  },
  methods: {
    decrypt() {
      this.modal = true;
      setTimeout(() => {
        try {
          const secret = bytes.unhide(
            this.sep,
            this.password,
            this.image1.bytes,
            this.image2.bytes
          );
          this.os = bytes.bytesToOctetStream(secret);
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