<template>
  <div id="app">
    <Encrypt />
    <Decrypt />
  </div>
</template>
<script>
export default {
  components: {
    Encrypt: () => import("@/components/Encrypt"),
    Decrypt: () => import("@/components/Decrypt"),
  },
};
</script>
<style lang="scss">
#app {
  .card {
    vertical-align: top;
    border: 1px solid gray;
    display: inline-block;
    margin: 10px;
    padding: 10px;
    max-width: 400px;
    min-height: 370px;
    position: relative;
    padding-bottom: 80px;

    h1 {
      padding-bottom: 20px;
    }

    label {
      display: inline-block;
      margin-bottom: 10px;
      width: 100%;
    }

    .transparent {
      color: transparent;
    }

    input {
      float: right;
    }

    .go {
      position: absolute;
      right: 10px;
      bottom: 10px;
      height: 40px;
      width: 80px;

      &.decrypt {
        background: rgba(200, 25, 25, 0.9);
      }

      &.encrypt {
        background: rgba(25, 200, 25, 0.9);
      }
    }

    .footer {
      position: absolute;
      background: rgba(0, 0, 0, 0.05);
      width: calc(100% - 2px);
      height: 60px;
      left: 1px;
      bottom: 1px;

      .download {
        margin-right: 10px;
        margin-top: 10px;
      }
    }
  }
}
</style>
