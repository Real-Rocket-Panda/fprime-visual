<template v-slot:header xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-container class="info-panel">
        <v-select
                :items="CompNames"
                box
                label="Name"
        ></v-select>
        <v-select
                :items="CompNameSpaces"
                box
                label="Namespace"
        ></v-select>

    </v-container>
</template>

<script>
    import Vue from "vue";
    import View from "@/store/view";
    export default Vue.extend({
        name: "info-panel",
        data(){
            return{
                CompNames:[],
                CompNameSpaces:[],
                ComPorts:[]
            };
        },
        created(){
            this.getComponentInfo;
        },
        computed:{
            getComponentInfo:function(){

                View.getComponents().then(value => {
                    var name = new Array;
                    var namespace = new Array;
                    var port = new Array;
                    for(var i=0; i < value.length;i++){
                        name.push(value[i].name.split('.')[1]);
                        namespace.push(value[i].namespace);
                        port.push(value[i].ports);
                    }
                    this.CompNames = name;
                    this.CompNameSpaces = namespace;
                    this.ComPorts = port;
                });
            }
        }
    })
</script>

<style>
    .info-panel {
        display: block;
        height: 300px;
        position: fixed;
        box-shadow: 0px -0.5px 1px #bdbdbd;
        background-color: white;
        z-index: 1000;
    }
</style>
