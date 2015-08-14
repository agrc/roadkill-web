<!DOCTYPE html>
<html>
	<head>
        <?php include("common_html/common.php") ?>
        
        <link rel='stylesheet' type='text/css' href='css/download.css' />
        <link rel="stylesheet" type="text/css" href="https://js.arcgis.com/3.8/js/dojo/dijit/themes/claro/claro.css">
        
        <script type='text/javascript'>
        	require(['dojo/domReady!'], function () {
        		require(['app/download']);
        	});
        </script>
	</head>
	<body class="claro">
		<div class="topbar">
			<?php include("common_html/header.php"); ?>
		</div>
		
		<div class="container">
			<div class="jumbotron">
				<h1>Download Data</h1>
				<p>Data can be downloaded as an ESRI Shapefile or DBF file. You can either download the entire dataset or a subset of the data using the filter below.</p>
			</div>
			<ul class="nav nav-tabs">
				<li class="active"><a data-toggle='tab' href="#all-data-tab">Get the entire database</a></li>
				<li><a data-toggle='tab' href="#filter-data-tab">Filter for a set of records</a></li>
			</ul>
			
			<div class="tab-content">
				<div id='all-data-tab' class='tab-pane active'>
					<div id='download-data'></div>
				</div>
				<div id='filter-data-tab' class="tab-pane">
					<div class='row'>
						<div class='col-md-3'>
							<h2>Filter</h2>
							<div id='data-filter'></div>
						</div>
						<div class='col-md-8'>
							<h2>Download</h2>
							<div id='download-data-filter'></div>
						</div>
					</div>
				</div>
			</div>
			<footer>
				<?php include('common_html/footer.php') ?>
			</footer>
		</div> <!-- /container -->
	</body>
</html>