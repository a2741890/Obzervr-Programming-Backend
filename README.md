# Obzervr-Programming-Backend
New York City has publicly released Taxi trip data for every trip from every taxi from 2014 to 2018. The web application shows the dataset of the pick-up locations on the map in New York City during January, 2015. When zooming down to an individual point, it will be displayed as a blue circle marker. On the other hand, zooming out will show clusters representing points in the specific area.

###### Data structure in use:  
<img src="https://github.com/a2741890/Obzervr-Programming-Backend/blob/master/dataStructure.PNG" height="240" width="480">  

###### Map:  
<img src="https://raw.githubusercontent.com/a2741890/Obzervr-Programming-Backend/master/map-middle.PNG" height="240" width="480">
<img src="https://raw.githubusercontent.com/a2741890/Obzervr-Programming-Backend/master/map-close.PNG" height="240" width="480">
<img src="https://raw.githubusercontent.com/a2741890/Obzervr-Programming-Backend/master/map-far.PNG" height="240" width="480">

  
  
## Technical Decision  

1. Clean dataset by removing invalid points and points outside New York City - *Python*  
[Ref: New York City Bourough Boundry](https://www1.nyc.gov/assets/planning/download/pdf/data-maps/open-data/nybb_metadata.pdf?ver=18c&fbclid=IwAR2mrijF5FkVlWSs_l8-HboUGaB5V9pFikgj0C6LObR-n1MaqM1WjTdgpPY)
2. Create 1 database including 2 collections - *MongoDB*  
 One includes more details(i.e fields) and the other only contains id and the array of longitude and latitude of the pick-up location.  
 First collection will provide more details.  
 The second one could provide a faster database query when we only need to show pick-up locations on the map without further details. 
3. RESTful API - *Node.js & Express.js*  
 Query and retrieve location information within the current view scale from database based on request params from client-side. (Not downloading all data for client-side)    
 Cluster these locations and send to the cliend-side.(Show clusters to reduce the size of the response and the pressure of the client-side render)  
 
 ## Future  
 The dataset contains 12.5 millions records and leads to the slow query (5-10 seconds for maximum scale) when the map requests for more data rendering at the client-side. (zoom out) Indexing and redesigning the data structure in the database can not help achieve a better performance. A database shard may be required to spread the data to different server to increase efficiency of the database query.  
