 /*
switch( event.keyCode ) {
	// p, page up
	case 80: case 33: navigatePrev(); break;
	// n, page down
	case 78: case 34: navigateNext(); break;
	// h, left
	case 72: case 37: navigateLeft(); break;
	// l, right
	case 76: case 39: navigateRight(); break;
	// k, up
	case 75: case 38: navigateUp(); break;
	// j, down
	case 74: case 40: navigateDown(); break;
	// home
	case 36: slide( 0 ); break;
	// end
	case 35: slide( Number.MAX_VALUE ); break;
	// space
	case 32: isOverview() ? deactivateOverview() : event.shiftKey ? navigatePrev() : navigateNext(); break;
	// return
	case 13: isOverview() ? deactivateOverview() : triggered = false; break;
	// two-spot, semicolon, b, v, period, Logitech presenter tools "black screen" button
	case 58: case 59: case 66: case 86: case 190: case 191: togglePause(); break;
	// f
	case 70: enterFullscreen(); break;
	// a
	case 65: if ( config.autoSlideStoppable ) toggleAutoSlide( autoSlideWasPaused ); break;
	default:
		triggered = false;
}
 */
$(document).ready(function() {

	var treeRoot;
	var activeElement = null;


	var NOT_VISITED = 0;
	var VISITED = 1;
	var ENTERED_MODE = 2;
	var EXITED_MODE = 3;
	var INSIDE_CHILD_MODE = 4;


	$( "body" ).keydown(function(event)  {
		console.log("keydown");
		if (!$("#canvas").hasClass("current-fragment")) {
			return;
		}
		
		console.log("event.which", event.which);
		if (event.which == 27) {
			
			
			
			if (activeElement) {
				refreshTree();
				activeElement = null;
			} else {
				refreshTree();
			}
			
			drawTree();
			return false;
		};
		
	
		if (!activeElement) {
			console.log("early return");
			return;
		}
		
		console.log("active element:", activeElement.text);
		
		switch(activeElement.status) {
		case ENTERED_MODE:
			for(var i=0; i<activeElement.children.length; i++) {
				var child = activeElement.children[i];
				if (child.status == NOT_VISITED && child.is_rule) {
					activeElement.status = INSIDE_CHILD_MODE;
					child.status = ENTERED_MODE;
					activeElement = child; 
					console.log(1);
					drawTree();
					return false;
				}
			}
			activeElement.status = EXITED_MODE;
			console.log(2);
			break;
		case EXITED_MODE:
			activeElement.status = VISITED;
			while (activeElement != null) {
				activeElement = activeElement.parent;
				if (!activeElement) {
					drawTree();
					return false;
				}
					
				for(var i=0; i<activeElement.children.length; i++) {
					var child = activeElement.children[i];
					if (child.status == NOT_VISITED && child.is_rule) {
						activeElement.status = INSIDE_CHILD_MODE;
						child.status = ENTERED_MODE;
						activeElement = child; 
						console.log(1);
						drawTree();
						return false;
					}
				}
				activeElement.status = EXITED_MODE;
				drawTree();
				return false;
			}
			
			
			
			console.log(3);
			break;
		default:
			activeElement.status = ENTERED_MODE;
			console.log(4);
		}
		drawTree();
		return false;
	});

	var canvas = document.getElementById('canvas');
	if (canvas.getContext){
		var ctx = canvas.getContext('2d');
		ctx.font = "16px sans-serif";
		
	}


	function drawTree() {	
		console.log("drawTree");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		var stack = [];
		stack.push(treeRoot);
		
		while (stack.length > 0) {
			var label = stack.pop();
			
			if (label.children.length > 0) {
				ctx.font = "bold 16px sans-serif";
			} else {
				ctx.font = "16px sans-serif";
			}
			
			var listenerAction = null;
			
			if (label.status == ENTERED_MODE) {
				ctx.fillStyle = "#00CC00";
				listenerAction = "Enter";
				//ctx.strokeStyle = "#00CC00";
			} else if (label.status == EXITED_MODE) {
				ctx.fillStyle = "#FF0000";
				listenerAction = "Exit";
				//ctx.strokeStyle = "#FF0000";
			} else if (label.status == INSIDE_CHILD_MODE) {
				ctx.fillStyle = "#AAA";
				//ctx.strokeStyle = "#999";
			} else {
				ctx.fillStyle = "#000000";
				//ctx.strokeStyle = "#000000";
			}
			ctx.fillText(label.text, label.x, label.y);
			//ctx.strokeText(label.text, label.x, label.y);
			
			if (listenerAction) {
				ctx.font = "40px Consolas";
				var text = listenerAction + capitalize(label.text);
				console.log(text);
				ctx.fillText(text, 500, 50);
			}
			
			
			
			
			
			for(var i=0; i<label.children.length; i++) {
				var child = label.children[i];
				stack.push(child);
				
				ctx.beginPath();
				ctx.moveTo(label.x + label.width/2, label.y + 4);
				ctx.lineTo(child.x + child.width/2, child.y - 15);
				
				if (child.status == ENTERED_MODE || child.status == EXITED_MODE || child.status == INSIDE_CHILD_MODE) {
					ctx.strokeStyle = "#AAA";
				} else {
					ctx.strokeStyle = "#000000";
				}
				
				ctx.stroke();
			}
		}
	};


	function initTree() {
		activeElement = treeRoot;

		var depths = [10, 50, 90, 130, 170, 210, 250, 290, 330, 350, 370];
		
		var stack = [];
		treeRoot.depth = 0;
		treeRoot.parent = null;
		stack.push(treeRoot);
		
		while (stack.length > 0) {
			var label = stack.pop();
			[x, y, text, children] = label;
			label.status = NOT_VISITED;
			label.x = x * 1.7;
			label.y = depths[label.depth] * 1.5;
			label.text = text;
			label.children = children;

			if (label.children.length > 0) {
				ctx.font = "bold 16px sans-serif";
				label.is_rule = true;
			} else {
				ctx.font = "16px sans-serif";
				label.is_rule = false;
			}
			label.width = ctx.measureText(label.text).width;
			
			for(var i=0; i<label.children.length; i++) {
				var child = label.children[i];
				child.depth = label.depth + 1;
				child.parent = label;
				[x, y, text, children] = child;
				child.x = x * 1.7;
				child.y = depths[child.depth] * 1.5;
				child.text = text;
				child.children = children;
				
				if (child.children.length > 0) {
					ctx.font = "bold 16px sans-serif";
				} else {
					ctx.font = "16px sans-serif";
				}
				child.width = ctx.measureText(child.text).width;
				stack.push(child);
			}
		}
	}
	
	
	function refreshTree() {
		activeElement = treeRoot;

		var stack = [];
		stack.push(treeRoot);
		
		while (stack.length > 0) {
			var label = stack.pop();
			label.status = NOT_VISITED;

			for(var i=0; i<label.children.length; i++) {
				var child = label.children[i];
				stack.push(child);
			}
		}
	}


	treeRoot = [
	   187,
	   9,
	   "main",
	   [
		  [
			 142,
			 41,
			 "functionDef",
			 [
				[
				   73,
				   73,
				   "func",
				   [

				   ]
				],
				[
				   106,
				   73,
				   "void",
				   [

				   ]
				],
				[
				   137,
				   73,
				   "testFunc",
				   [

				   ]
				],
				[
				   190,
				   73,
				   "(",
				   [

				   ]
				],
				[
				   205,
				   73,
				   ")",
				   [

				   ]
				],
				[
				   220,
				   73,
				   "block",
				   [
					  [
						 9,
						 105,
						 "{",
						 [

						 ]
					  ],
					  [
						 24,
						 105,
						 "statement",
						 [
							[
							   13,
							   137,
							   "varDecl",
							   [
								  [
									 2,
									 169,
									 "var",
									 [

									 ]
								  ],
								  [
									 29,
									 169,
									 "int",
									 [

									 ]
								  ],
								  [
									 51,
									 169,
									 "x",
									 [

									 ]
								  ]
							   ]
							],
							[
							   61,
							   137,
							   ";",
							   [

							   ]
							]
						 ]
					  ],
					  [
						 99,
						 105,
						 "statement",
						 [
							[
							   75,
							   137,
							   "assignment",
							   [
								  [
									 71,
									 169,
									 "x",
									 [

									 ]
								  ],
								  [
									 88,
									 169,
									 "=",
									 [

									 ]
								  ],
								  [
									 105,
									 169,
									 "expression",
									 [
										[
										   104,
										   201,
										   "functionCall",
										   [
											  [
												 37,
												 233,
												 "HLP_Random",
												 [

												 ]
											  ],
											  [
												 112,
												 233,
												 "(",
												 [

												 ]
											  ],
											  [
												 127,
												 233,
												 "expression",
												 [
													[
													   141,
													   265,
													   "value",
													   [
														  [
															 145,
															 297,
															 "100",
															 [

															 ]
														  ]
													   ]
													]
												 ]
											  ],
											  [
												 192,
												 233,
												 ")",
												 [

												 ]
											  ]
										   ]
										]
									 ]
								  ]
							   ]
							],
							[
							   141,
							   137,
							   ";",
							   [

							   ]
							]
						 ]
					  ],
					  [
						 394,
						 105,
						 "statement",
						 [
							[
							   370,
							   137,
							   "ifStatement",
							   [
								  [
									 236,
									 169,
									 "if",
									 [

									 ]
								  ],
								  [
									 253,
									 169,
									 "ifCondition",
									 [
										[
										   236,
										   201,
										   "(",
										   [

										   ]
										],
										[
										   251,
										   201,
										   "expression",
										   [
											  [
												 207,
												 233,
												 "expression",
												 [
													[
													   221,
													   265,
													   "value",
													   [
														  [
															 231,
															 297,
															 "x",
															 [

															 ]
														  ]
													   ]
													]
												 ]
											  ],
											  [
												 272,
												 233,
												 ">=",
												 [

												 ]
											  ],
											  [
												 295,
												 233,
												 "expression",
												 [
													[
													   309,
													   265,
													   "value",
													   [
														  [
															 316,
															 297,
															 "50",
															 [

															 ]
														  ]
													   ]
													]
												 ]
											  ]
										   ]
										],
										[
										   316,
										   201,
										   ")",
										   [

										   ]
										]
									 ]
								  ],
								  [
									 416,
									 169,
									 "block",
									 [
										[
										   390,
										   201,
										   "{",
										   [

										   ]
										],
										[
										   405,
										   201,
										   "statement",
										   [
											  [
												 380,
												 233,
												 "functionCall",
												 [
													[
													   346,
													   265,
													   "Print",
													   [

													   ]
													],
													[
													   378,
													   265,
													   "(",
													   [

													   ]
													],
													[
													   393,
													   265,
													   "expression",
													   [
														  [
															 407,
															 297,
															 "value",
															 [
																[
																   394,
																   329,
																   "\"You win!\"",
																   [

																   ]
																]
															 ]
														  ]
													   ]
													],
													[
													   458,
													   265,
													   ")",
													   [

													   ]
													]
												 ]
											  ],
											  [
												 447,
												 233,
												 ";",
												 [

												 ]
											  ]
										   ]
										],
										[
										   463,
										   201,
										   "}",
										   [

										   ]
										]
									 ]
								  ],
								  [
									 482,
									 169,
									 "else",
									 [

									 ]
								  ],
								  [
									 543,
									 169,
									 "block",
									 [
										[
										   517,
										   201,
										   "{",
										   [

										   ]
										],
										[
										   532,
										   201,
										   "statement",
										   [
											  [
												 507,
												 233,
												 "functionCall",
												 [
													[
													   473,
													   265,
													   "Print",
													   [

													   ]
													],
													[
													   505,
													   265,
													   "(",
													   [

													   ]
													],
													[
													   520,
													   265,
													   "expression",
													   [
														  [
															 534,
															 297,
															 "value",
															 [
																[
																   521,
																   329,
																   "\"You lose\"",
																   [

																   ]
																]
															 ]
														  ]
													   ]
													],
													[
													   585,
													   265,
													   ")",
													   [

													   ]
													]
												 ]
											  ],
											  [
												 574,
												 233,
												 ";",
												 [

												 ]
											  ]
										   ]
										],
										[
										   590,
										   201,
										   "}",
										   [

										   ]
										]
									 ]
								  ]
							   ]
							],
							[
							   435,
							   137,
							   ";",
							   [

							   ]
							]
						 ]
					  ],
					  [
						 452,
						 105,
						 "}",
						 [

						 ]
					  ]
				   ]
				],
				[
				   256,
				   73,
				   ";",
				   [

				   ]
				]
			 ]
		  ],
		  [
			 209,
			 41,
			 "<EOF>",
			 [

			 ]
		  ]
	   ]
	];

	initTree();
	drawTree();


	function capitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

});