<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="esri/dijit/css/Popup.css">
		<link rel="stylesheet" type="text/css" href="esri/css/esri.css">


		<?php include "common_html/common.php"; ?>
        <link rel="stylesheet" tyep="text/css" href="css/map.css" />
        <script type="text/javascript">
        	require(['dojo/domReady!'], function () {
        		require(['app/map']);
        	});
        </script>
	</head>
	<body class="claro">
		<div id="loading-dialog" class="hidden">
			<div class='modal'>
				<div class='modal-header'>
					<h3>This might take a few moments...</h3>
				</div>
				<div class='modal-body'>
					<p>Loading map <img alt="loader" src="images/ajax-loader.gif"></p>
				</div>
			</div>
			<div class="modal-background"></div>
		</div>
		<div data-dojo-type="dijit/layout/BorderContainer" id="main-container" data-dojo-props="gutters: false">
			<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region: 'top'" class="topbar">
				<?php include "common_html/header.php"; ?>
			</div>
			<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region: 'left'" id="left-sidebar" class='hidden'>
				<div id='pane-stack'>
					<div title="Legend">
						<div id="legend"></div>
					</div>
					<div title="Map Layers">
						<div id="toc"></div>
					</div>
					<div title="Data Filter">
						<div id="data-filter"></div>
					</div>
					<div title="Download Data">
						The data will be filtered according to the "Data Filter" above.
						<div id='download-data'></div>
					</div>
					<div id='species-chart-pane' title='Species Chart'>
						Species shown honor the "Data Filter" above.
						<div id='species-chart'></div>
					</div>
					<div title='Print Map'>
						<div id='print-div'></div>
					</div>
				</div>
			</div>
			<div data-dojo-type="dijit/layout/ContentPane"
				data-dojo-props='region: "center"' class='map-div-container'>
				<div id="map-div">
				</div>
					<div id="HomeButtonDiv"></div>
			</div>
			<div id='footer' data-dojo-type='dijit/layout/ContentPane' data-dojo-props="region: 'bottom'">
				<?php include 'common_html/footer.php'; ?>
			</div>
		</div>
		<div id="legend-map" style="display: none"></div>
	</body>
</html>
