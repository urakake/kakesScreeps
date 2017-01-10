/** -------------------------------------------- role.slave ------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleSlave = {
     run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	}, 
	makeSlave: function(spawn){
	    var cap = spawn.room.energyAvailable;
        var creepName="controllerSlave@"+spawn.room.name;
        console.log("Creating Creep ("+creepName+")");
        if(cap<300){   // under 300
            spawn.createCreep( makeParts(1,1,1), creepName, { role: 'slave' } );
        } else if(cap<550){   // 300-549
            spawn.createCreep( makeParts(2,2,1), creepName, { role: 'slave' } );
        } else if(cap<800){   // 550-799
            spawn.createCreep( makeParts(3,4,2), creepName, { role: 'slave' } );
        } else if(cap<1300){   // 800-1299
            spawn.createCreep( makeParts(4,6,3), creepName, { role: 'slave' } );
        } else if(cap<1800){   // 1300-1799
            spawn.createCreep( makeParts(4,6,3), creepName, { role: 'slave' } );
        } else if(cap<2300){   // 1800-2299
            spawn.createCreep( makeParts(4,6,3), creepName, { role: 'slave' } );
        } else {   // 2300+
            spawn.createCreep( makeParts(4,6,3), creepName, { role: 'slave' } );
        }
	},
	checkSlave: function(spawn){
	    var myRoom=spawn.room
	    var foundMissing=false;
	    if(myRoom.memory.numSlaves<1){
	        foundMissing=true;
	    }
	    return foundMissing;
	}
};
function init(creep) {
    console.log("Initializing Slave - "+creep.name);
    creep.memory.init=true;
	if(creep.memory.assignedNode==undefined){
	    creep.memory.assignedNode="";
	} else {
	    var sources = creep.room.find(FIND_SOURCES);
    	creep.memory.assignedNode=sources[creep.room.memory.sourceIter].id;
    	creep.room.memory.sourceIter+=1;
    	if (creep.room.memory.sourceIter==creep.room.memory.sourceNum){
    		creep.room.memory.sourceIter=0;
    	}
	}
	if(creep.memory.role==undefined){
	    creep.memory.role="slave";
	}
	
}
function work(creep) {
    // check if energy is empty
	if(creep.carry.energy == 0 && creep.memory.state != "gather") {
		creep.memory.state = "gather";
		creep.say('gather');
	}else if(creep.memory.state == "gather"){
		gather(creep);
	} else if(creep.room.controller.level!=8 && creep.memory.state == "upgrade") {
		upgrade(creep)
	} else {
	    dump(creep)
	}
}
function gather(creep) {
	if(creep.carry.energy < creep.carryCapacity) {
	    var targetSource = Game.getObjectById(creep.memory.assignedNode);
	    if (targetSource!=null){
	        if(targetSource.energy != 0 && creep.harvest(targetSource) == ERR_NOT_IN_RANGE){
    			creep.moveTo(targetSource);
    		} else if (targetSource.energy == 0){ 

    		}
	    } else {
	        var sources = creep.room.find(FIND_SOURCES);
        	creep.memory.assignedNode=sources[creep.room.memory.sourceIter].id;
        	creep.room.memory.sourceIter+=1;
        	if (creep.room.memory.sourceIter==creep.room.memory.sourceNum){
        		creep.room.memory.sourceIter=0;
        	}
	    }
	} else {
		creep.memory.state = "upgrade";
		creep.say('upgrade');
		//work(creep);
	}
}
function upgrade(creep) {
    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
    }
}
function dump(creep) {
    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
    }
}
function makeParts(moves, carries, works) {
    var list = [];
    for(var i=0;i<moves;i++){
        list.push(MOVE);
    }
    for(var i=0;i<carries;i++){
        list.push(CARRY);
    }
    for(var i=0;i<works;i++){
        list.push(WORK);
    }
    return list;
}


module.exports = roleSlave;