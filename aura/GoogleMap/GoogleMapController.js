({
	doInit : function(component, event, helper) {
	    //Send LC Host as parameter to VF page so VF page can send message to LC; make it all dynamic
        component.set('v.lcHost', window.location.hostname);

        var objectType = component.get("v.objectType");
        var nameField = component.get("v.nameField");
        var geoLocField = component.get("v.geoLocField");
        var nameValue = component.get("v.nameValue");
        
        if ((objectType == null) || (nameField == null) || (geoLocField == null) || (nameValue == null))  
            return;
  		//Add message listener
  		//  		
        window.addEventListener("message", $A.getCallback (function(event) {
     
            // Handle the message
           
            var d = JSON.parse(event.data);
            if(d.state == 'LOADED'){
                //Set vfHost which will be used later to send message
            
                component.set('v.vfHost', d.vfHost);
 
                //Send data to VF page to draw map
                helper.sendToVF(component, helper);
            } else if (d.state == 'CHANGED') {
                var newMapData = Array();
                var mapDataObj; 
                var a = component.get('v.mapData');
               
                if (a.length >0) {
                	mapDataObj = a[0];
                	mapDataObj.lat = d.lat;
                	mapDataObj.lng = d.lng;
                
                	newMapData.push(mapDataObj);

                	component.set ('v.mapData', newMapData);
                }    
            } else if (d.state == "UPDATE") {

                 var a = component.get('v.mapData');
                 var updateMapData = a[0];
          		 var action = component.get("c.updateGeoLocation");
           
                 action.setParams({ 
                        objectType : objectType, 
                        nameField : nameField,
                        geoLocField : geoLocField, 
                        id : updateMapData.id,
                     	lat : updateMapData.lat,
                     	lng : updateMapData.lng
                 });

                action.setCallback(this, function(response) {
                    var state = response.getState();
                    var str = response.getReturnValue();
                    
                    if (state == "SUCCESS") {
                        alert('Geolocation Updated !')
                    } else if (state == "ERROR") {                                          
                        var errors = response.getError();
                        if (errors) {
                            if (errors[0] && errors[0].message) {
                                console.log("Error message: " +
                                         errors[0].message);
                            }
                        } else {
                            console.log("Unknown error");
                        }
                     }
                });
                
                $A.enqueueAction(action);                                              
       
            }
        }), false);
        
       var action = component.get("c.getMapObject");
        
        action.setParams({ 
            objectType : objectType,
            nameField : nameField,
            geoLocField : geoLocField,
            key : nameValue 
        });

        action.setCallback(this, function(response){
            var state = response.getState();
  
            if (state == "ERROR") {
                //var mapObjJSON = response.getReturnValue();
                var errors = response.getError();
				if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " +
                                 errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }    
            
            if (state == "SUCCESS") {
                var mapObjJSON = response.getReturnValue();
                var mapData = Array();
                var mapOptionsCenter;
                
                if (mapObjJSON.length > 0) {
                    var mapObj = JSON.parse(mapObjJSON);
    
                    mapOptionsCenter = {"lat":parseFloat(mapObj.lat), "lng":parseFloat(mapObj.lng)};
                   
                    mapData.push({"id":mapObj.id, "name":mapObj.name, "lat":parseFloat(mapObj.lat),
                                      "lng":parseFloat(mapObj.lng), "markerText":mapObj.name})                
         
                    component.set('v.mapOptionsCenter', mapOptionsCenter);
                    component.set('v.mapData', mapData);
                //    component.set('v.mapDataObj', mapData[0]);                    
                } else {
                    
                    mapOptionsCenter = {"lat":0, "lng":0};
                    component.set('v.mapOptionsCenter', mapOptionsCenter);
                    component.set('v.mapData', mapData);
                  //  component.set('v.mapDataObj', null);                                         
                } 
                
            }

        });
        $A.enqueueAction(action);
    }
})