<template v-slot:header xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-container class="info-panel">
        <v-autocomplete
                v-model="compAttributes.NameSpace"
                :items="compAttributes.NameSpaces"
                label="NameSpace"
        ></v-autocomplete>
        <v-text-field
                v-model="compAttributes.Name"
                label="Name"
        ></v-text-field>
        <v-autocomplete
                v-model="compAttributes.Type"
                :items="compAttributes.Types"
                label="Type"
        ></v-autocomplete>
        <v-text-field
                v-model="compAttributes.BaseID"
                label="BaseID"
        ></v-text-field>
        <v-btn color="success" @click="updateComponentInfo()">Update</v-btn>
    </v-container>
</template>

<script lang='ts'>
    import Vue from "vue";
    import view from "@/store/view";
    import CyManager from "@/store/CyManager";
import fprime from "../../fprime";
import { ViewType } from "../../fprime/FPPModelManagement/FPPModelManager";
    export default Vue.extend({
        name: "info-panel",
        data(){
            return{
                // @TODO: compName & baseid
                OldCompAttributes: {
                    Name: "",
                    BaseID: "",
                    Type: "",
                    NameSpace: "",
                    NameSpaces: [""],
                    Types: [""],
                    Ports: [""],
                },
                compAttributes: {
                    Name: "",
                    BaseID: "",
                    Type: "",
                    NameSpace: "",
                    NameSpaces: [""],
                    Types: [""],
                    Ports: [""],
                }
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
                    var type:string[] = new Array();
                    var namespace:string[] = new Array();
                    //var port:string[] = new Array();
                    for(var i=0; i < value.length;i++){
                        type.push(value[i].name);
                        namespace.push(value[i].namespace);
                        //port.push(value[i].ports);
                    }
                    this.compAttributes.Types = type;
                    this.compAttributes.NameSpaces = namespace;
                    //this.comPorts = port;
                });
            }
        },
        // Get the information of the selected component and assign it to the v-model of the selector.
        methods:{
            showComponentInfo(compType :string, compNamespace: string, compName: string, compBaseID: string){
                this.compAttributes.Name = compName;
                this.compAttributes.BaseID = compBaseID;
                this.compAttributes.Type = compType;
                this.compAttributes.NameSpace = compNamespace;
                this.OldCompAttributes.Name = compName;
                this.OldCompAttributes.BaseID = compBaseID;
                this.OldCompAttributes.Type = compType;
                this.OldCompAttributes.NameSpace = compNamespace;
            },
            updateComponentInfo(){
                if(this.compAttributes.Type && this.compAttributes.NameSpace && this.compAttributes.Name && this.compAttributes.BaseID){
                    // CyManager.cyUpdateComponentInfo(this.compType, this.compNameSpace);
                    // 1 update model
                    const result = fprime.viewManager.updateAttributes(ViewType.InstanceCentric, 
                    {
                        ["Type"] : this.compAttributes.Type,
                        ["NameSpace"] : this.compAttributes.NameSpace,
                        ["Name"] : this.compAttributes.Name,
                        ["BaseID"] : this.compAttributes.BaseID,
                        ["NewName"] : this.compAttributes.NameSpace + "." + this.compAttributes.Name,
                        ["OldName"] : this.OldCompAttributes.NameSpace + "." + this.OldCompAttributes.Name
                    });
                    if(result) {
                        // 2 content: rerender
                        console.log(this.compAttributes.NameSpace + "." + this.compAttributes.Name);
                        this.$root.$emit("updateContent", this.compAttributes.NameSpace + "." + this.compAttributes.Name);
                    }
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
        height: 350px;
        position: fixed;
        box-shadow: 0px -0.5px 1px #bdbdbd;
        background-color: white;
        z-index: 1000;
    }
</style>
