<template>
  <div class="frame">
    <p>{{text}}</p>
  </div>
</template>

<script>
export default {
  name: 'app',
  props: ['text'],
  data: function() {
    return {
    }
  }
}

</script>

<style>
.frame {
  width: 300px;
  height: auto;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  margin: 0.5em;
  padding-left: 15px;
  border-radius: 30px;
  /* opacity: 0.0; */
  background: rgba(0, 0, 0, 0.5);
  /* animation: fade 0.5s 0s ease 1 normal; */
}

p {
  margin: 0px;
  font-family: "Microsoft YaHei";
  color: #FFFFFF;
}

.frame:hover {
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

</style>