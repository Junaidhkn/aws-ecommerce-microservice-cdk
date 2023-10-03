import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";


exports.handler = async function ( event ) {
   console.log( 'request: ', JSON.stringify( event, undefined, 2 ) )


   switch ( event.httpMethod ) {
      case "GET":
         if ( event.pathParameters != null ) {
            body = await getProduct( event.pathParameters.id );
         } else {
            body = await getAllProducts();
         }
   }



   return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Hello from product ! You have got a hit at ${event.path}/n`
   }
}


const getProduct = async ( productId ) => {
   console.log( "getProduct", productId )
   try {
      const params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Key: marshall( {
            id: productId
         } ),
      }
      const data = await dynamodb.send( new GetItemCommand( params ) )
      console.log( "Success", data.Item )
      return { item }
   } catch ( error ) {
      console.log( error )
      throw error
   }

}

const getAllProducts = async () => {

}