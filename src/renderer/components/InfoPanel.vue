<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-expansion-panel>
        <v-expansion-panel-content
                v-for="(item,i) in 5"
                :key="i"
        >
            <template v-slot:header>
                <div>Item</div>
            </template>
            <v-card>
                <v-card-text>Hello World.</v-card-text>
            </v-card>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<script>
    export default {
        name: "InfoPanel"
    }
</script>

<style scoped>

</style>
