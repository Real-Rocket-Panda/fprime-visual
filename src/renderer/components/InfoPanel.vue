<template v-slot:header xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-container class="info-panel">
        <v-autocomplete
                v-model="compName"
                :items="compNames"
                label="Type"
        ></v-autocomplete>
        <v-autocomplete
                v-model="compNameSpace"
                :items="compNameSpaces"
                label="NameSpace"
        ></v-autocomplete>
        <v-btn color="success" @click="updateComponentInfo()">Update</v-btn>
    </v-container>
</template>

<script lang='ts'>
    import Vue from "vue";
    import view from "@/store/view";
    import CyManager from "@/store/CyManager";
    export default Vue.extend({
        name: "info-panel",
        data(){
            return{
                compName: "",
                compNameSpace: "",
                compNames:[""],
                compNameSpaces:[""],
                comPorts:[""]
            };
        },
        created(){
            this.getComponentInfo;
        },
        mounted(){
            CyManager.cyShowComponentInfo = this.showComponentInfo;
        },
        // Get all components in the current model and push them to the items of the selector.
        computed:{
            getComponentInfo: function() {

                view.getComponents().then(value => {
                    var name:string[] = new Array();
                    var namespace:string[] = new Array();
                    //var port:string[] = new Array();
                    for(var i=0; i < value.length;i++){
                        name.push(value[i].name.split('.')[1]);
                        namespace.push(value[i].namespace);
                        //port.push(value[i].ports);
                    }
                    this.compNames = name;
                    this.compNameSpaces = namespace;
                    //this.comPorts = port;
                });
            }
        },
        // Get the information of the selected component and assign it to the v-model of the selector.
        methods:{
            showComponentInfo(compType :string, compNamespace: string){
                this.compName = compType;
                this.compNameSpace = compNamespace;
            },
            updateComponentInfo(){
                if(this.compName && this.compNameSpace){
                    CyManager.cyUpdateComponentInfo(this.compName, this.compNameSpace);
                }
                else{
                    alert("Please use valid input!");
                }
            }
        },
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
