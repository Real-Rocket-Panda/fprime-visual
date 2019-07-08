<template>
    <v-footer app fixed :height="height" style="min-height: 20px">
        <v-btn
                flat
                small
                class="msg-footer-btn"
                :style="{ height: height + 'px' }"
                id="show-panel-output"
                @click="showOutput"
        >
            Output
        </v-btn>
        <v-btn
                flat
                small
                class="msg-footer-btn"
                :style="{ height: height + 'px' }"
                id="show-panel-analysis"
                @click="showAnalysis"
        >
            Analysis
        </v-btn>
        <v-btn
                flat
                small
                class="msg-footer-btn"
                :style="{ height: height + 'px' }"
                id="show-panel-editor"
                @click="showEditor"
        >
            Editor
        </v-btn>
        <v-spacer></v-spacer>
        <span class="mr-2 caption">&copy; 2019 The Jet Trio</span>
    </v-footer>
</template>

<script lang="ts">
    import Vue from "vue";
    import panel from "@/store/panel";

    export default Vue.extend({
        props: ["height"],
        name: "message-footer",
        methods: {
            showOutput() {
                panel.showOutput();
            },
            showAnalysis() {
                panel.showAnalysis();
            },
            showEditor() {
                panel.showEditor();
            }
        }
    });
</script>

<style>
    .msg-footer-btn {
        text-transform: none;
        margin: 0px;
    }
</style>

