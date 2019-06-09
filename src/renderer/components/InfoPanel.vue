<template v-slot:header xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-container class="info-panel">
    <span>Port Type:</span>
    <select>
        <option disabled value="">Please select one</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
    </select>
        <br>
    <span>Port Name:</span>
    <select>
        <option disabled value="">Please select one</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
    </select>
        <br>
    <span>Kind:</span>
    <select>
        <option disabled value="">Please select one</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
    </select>
        <br>
    <span>Direction:</span>
    <select>
        <option disabled value="">Please select one</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
    </select>
        <br>
    <span>Number:</span>
    <select>
        <option disabled value="">Please select one</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
    </select>
        <br>
    <span>Role:</span>
    <select>
        <option disabled value="">Please select one</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
    </select>
    </v-container>
</template>

<script>
    import Vue from "vue";
    export default Vue.extend({
        name: "info-panel",
    })

</script>

<style>
.info-panel {
    display: block;
    height: 200px;
    position: fixed;
    box-shadow: 0px -0.5px 1px #bdbdbd;
    background-color: white;
    z-index: 1000;
}
</style>
