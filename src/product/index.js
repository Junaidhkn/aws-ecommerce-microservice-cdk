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