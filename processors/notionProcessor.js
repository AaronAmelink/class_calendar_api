const dp = require('./pageProcessor');
const up = require("../processors/userProcessor");
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_KEY });
const pageId = process.env.NOTION_PAGE_ID;
class notionProcessor {
    constructor() {
        if (!notionProcessor.instance){
            notionProcessor.instance = this;
        }
        return notionProcessor.instance;
    }

    async createPage(parent, props, name){
        //https://developers.notion.com/reference/property-object
        // if creating for database, db props MUST be same as page props.
        try{
            let result = await notion.pages.create({
                parent,
                "properties" : {
                    "Name" : {
                        "title" : [
                            {
                                "text" : {
                                    "content" : name
                                }
                            }
                        ]
                    },
                    props
                }

            })
        }
        catch (e){
            console.log(e);
            return null;
        }
    }

    async createDatabase(name, props){
        //properties example:
        //
        // properties: {
        //                     // These properties represent columns in the database (i.e. its schema)
        //                     "Grocery item": {
        //                         type: "title",
        //                         title: {},
        //                     },
        //                     Price: {
        //                         type: "number",
        //                         number: {
        //                             format: "dollar",
        //                         },
        //                     },
        //                     "Last ordered": {
        //                         type: "date",
        //                         date: {},
        //                     },
        //                 },
        //
        //https://developers.notion.com/reference/property-object
        try{
            let newDb = await notion.databases.create({
                parent: {
                    type: "page_id",
                    page_id: pageId,
                },
                title: [
                    {
                        type: "text",
                        text: {
                            content: name,
                        },
                    },
                ],
                properties: {
                    // These properties represent columns in the database (i.e. its schema)
                    "Name": {
                        type: "title",
                        title: {},
                    },
                    props,
                },

            })
            console.log(newDb);
            return newDb;
        }
        catch (e){
            console.log(e);
            return null;
        }


    }
}




const instance = new notionProcessor();
module.exports = instance;