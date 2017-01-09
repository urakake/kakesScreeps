/** -------------------------------------------- autoBuild ------------------------------------------
 * by Urakake     **/
		
var autoBuild = {
    run: function(myRoom) {
        myRoom.memory.numExtensions=0;
        myRoom.memory.numTowers=0;
        countStructures(myRoom);
        if(myRoom.controller.level==2){
            if(myRoom.memory.numExtensions<5){
                setupContLvl2(myRoom);
            }
        } else if(myRoom.controller.level==3){
            if(myRoom.memory.numExtensions<10&&myRoom.memory.numTowers<1){
				setupContLvl2(myRoom);
                setupContLvl3(myRoom);
            }
        } else if(myRoom.controller.level==4){
            if(myRoom.memory.numExtensions<20&&myRoom.memory.numTowers<1){
				setupContLvl2(myRoom);
                setupContLvl3(myRoom);
                setupContLvl4(myRoom);
            }
        } else if(myRoom.controller.level==5){
            if(myRoom.memory.numExtensions<30&&myRoom.memory.numTowers<2){
				setupContLvl2(myRoom);
                setupContLvl3(myRoom);
                setupContLvl4(myRoom);
                setupContLvl5(myRoom);
            }
        } else if(myRoom.controller.level==6){
            if(myRoom.memory.numExtensions<40&&myRoom.memory.numTowers<2){
				setupContLvl2(myRoom);
                setupContLvl3(myRoom);
                setupContLvl4(myRoom);
                setupContLvl5(myRoom);
                setupContLvl6(myRoom);
            }
        }
            
	}
};
function setupContLvl2(myRoom) {
    console.log("auto building lvl 2");
	var thisSpawn; 
	for(var j in Game.spawns) {
		if (Game.spawns[j].room==myRoom){
			thisSpawn=Game.spawns[j];
		}
	}
	myRoom.createConstructionSite(thisSpawn.pos.x,thisSpawn.pos.y+1,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x,thisSpawn.pos.y+2,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x,thisSpawn.pos.y+3,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x,thisSpawn.pos.y+4,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x,thisSpawn.pos.y+5,STRUCTURE_EXTENSION);
	
}
function setupContLvl3(myRoom) {
    console.log("auto building lvl 3");
	var thisSpawn; 
	for(var j in Game.spawns) {
		if (Game.spawns[j].room==myRoom){
			thisSpawn=Game.spawns[j];
		}
	}
	myRoom.createConstructionSite(thisSpawn.pos.x+1,thisSpawn.pos.y+1,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+1,thisSpawn.pos.y+2,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+1,thisSpawn.pos.y+3,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+1,thisSpawn.pos.y+4,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+1,thisSpawn.pos.y+5,STRUCTURE_EXTENSION);
	
	myRoom.createConstructionSite(thisSpawn.pos.x+1,thisSpawn.pos.y,STRUCTURE_TOWER);
	
	myRoom.createConstructionSite(thisSpawn.pos.x-1,thisSpawn.pos.y-1,STRUCTURE_ROAD);
	myRoom.createConstructionSite(thisSpawn.pos.x-1,thisSpawn.pos.y,STRUCTURE_ROAD);
	myRoom.createConstructionSite(thisSpawn.pos.x-1,thisSpawn.pos.y+1,STRUCTURE_ROAD);
	myRoom.createConstructionSite(thisSpawn.pos.x-1,thisSpawn.pos.y+2,STRUCTURE_ROAD);
	myRoom.createConstructionSite(thisSpawn.pos.x-1,thisSpawn.pos.y+3,STRUCTURE_ROAD);
	myRoom.createConstructionSite(thisSpawn.pos.x-1,thisSpawn.pos.y+4,STRUCTURE_ROAD);
	myRoom.createConstructionSite(thisSpawn.pos.x-1,thisSpawn.pos.y+5,STRUCTURE_ROAD);
	myRoom.createConstructionSite(thisSpawn.pos.x-1,thisSpawn.pos.y+6,STRUCTURE_ROAD);
}
function setupContLvl4(myRoom) {
    console.log("auto building lvl 4");
	var thisSpawn; 
	for(var j in Game.spawns) {
		if (Game.spawns[j].room==myRoom){
			thisSpawn=Game.spawns[j];
		}
	}
	myRoom.createConstructionSite(thisSpawn.pos.x-2,thisSpawn.pos.y+1,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x-2,thisSpawn.pos.y+2,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x-2,thisSpawn.pos.y+3,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x-2,thisSpawn.pos.y+4,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x-2,thisSpawn.pos.y+5,STRUCTURE_EXTENSION);
	
	myRoom.createConstructionSite(thisSpawn.pos.x-3,thisSpawn.pos.y+1,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x-3,thisSpawn.pos.y+2,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x-3,thisSpawn.pos.y+3,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x-3,thisSpawn.pos.y+4,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x-3,thisSpawn.pos.y+5,STRUCTURE_EXTENSION);
	
	myRoom.createConstructionSite(thisSpawn.pos.x+1,thisSpawn.pos.y+6,STRUCTURE_STORAGE);
}
function setupContLvl5(myRoom) {
    console.log("auto building lvl 5");
	var thisSpawn; 
	for(var j in Game.spawns) {
		if (Game.spawns[j].room==myRoom){
			thisSpawn=Game.spawns[j];
		}
	}
	myRoom.createConstructionSite(thisSpawn.pos.x+3,thisSpawn.pos.y+1,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+3,thisSpawn.pos.y+2,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+3,thisSpawn.pos.y+3,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+3,thisSpawn.pos.y+4,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+3,thisSpawn.pos.y+5,STRUCTURE_EXTENSION);
	
	myRoom.createConstructionSite(thisSpawn.pos.x+4,thisSpawn.pos.y+1,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+4,thisSpawn.pos.y+2,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+4,thisSpawn.pos.y+3,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+4,thisSpawn.pos.y+4,STRUCTURE_EXTENSION);
	myRoom.createConstructionSite(thisSpawn.pos.x+4,thisSpawn.pos.y+5,STRUCTURE_EXTENSION);
	
	myRoom.createConstructionSite(thisSpawn.pos.x,thisSpawn.pos.y+6,STRUCTURE_TOWER);
}

function countStructures(myRoom) {
    var targets = myRoom.find(FIND_STRUCTURES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_TOWER)
            }
    });
    for (var i in targets){
        if(targets[i].structureType == STRUCTURE_EXTENSION){
            myRoom.memory.numExtensions++;
        } else if (targets[i].structureType == STRUCTURE_TOWER){
            myRoom.memory.numTowers++;
        }
    }
    var targets = myRoom.find(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_TOWER)
            }
    });
    for (var i in targets){
        if(targets[i].structureType == STRUCTURE_EXTENSION){
            myRoom.memory.numExtensions++;
        } else if (targets[i].structureType == STRUCTURE_TOWER){
            myRoom.memory.numTowers++;
        }
    }
}

module.exports = autoBuild;