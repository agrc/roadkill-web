<!DOCTYPE html>
<html>
    <head>
        <?php include "common_html/stand-alone.php"; ?>
        <link rel='stylesheet' href="css/release_notes.css">
    </head>
    <body>
        <div class="container">
            <p><a class="btn btn-primary" href="index.php">&laquo; Back to Home Page</a></p>
            <h2>Roadkill Reporter Release Notes</h2>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Version</th>
                        <th>Changes</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="version">3.0.1</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Fixed bug causing incorrect projections in data entry page when entering UTM coordinates.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="version">3.0.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Switch to web mercator.</li>
                                <li>Upgrade all libraries to their latest releases.</li>
                                <li>Add a home button to the user admin page.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="version">2.2.1</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Update Google Analytics code</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="version">2.2.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Upgrade to use webapi instead of WSUT</li>
                                <li>Upgrades to esri/dojo and other apis</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="version">2.1.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Upgraded user management system</li>
                                <li>Backend build improvements</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="version">2.0.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Upgraded desktop app ESRI JS API to 3.8 and back end server to 10.2.</li>
                                <li>Upgraded desktop app to Bootstrap 3.0.3.</li>
                                <li>Switched desktop to using the LoginRegister widget and ArcGISPermissionProxy.</li>
                                <li>Switched mobile app to hit ArcGISPermissionProxy.</li>
                                <li>Upgraded project structure to match latest AGRC Boilerplate.</li>
                                <li>Split out ROUTE_MILEPOST field to be ROUTE, ROUTE_DIR and MILEPOST fields.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>1.1.1</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Fixed bug with the app displaying the incorrect time for reports.</li>
                                <li>Fixed a bug preventing mobile users from logging into the desktop map page.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>1.1.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Added RESPONDER_EMAIL, RESPONDER_AGENCY, RESPONDER_NAME, & WMU fields to the reports feature class. These fields should now show up in the pop-up on the map as well as the data that is downloaded as either shapefile or .dbf file.</li>
                                <li>Created script that runs nightly to auto-populate: RESPONDER_EMAIL, RESPONDER_AGENCY, RESPONDER_NAME, ROUTE_MILEPOST, UDWR_REGION, UDOT_REGION, HIGHWAY_ROAD, & WMU. Please note that these fields will not be populated for new reports until the day after they are submitted to the database.</li>
                                <li>Added a new filter to the "Data Filter" pane that allows you to filter the data by one or more user email addresses.</li>
                                <li>Added UDOT Mileposts as a map layer.</li>
                                <li>Added WMU as a map background layer.</li>
                                <li>Fixed bug with Chrome freezing when zooming multiple levels at one time.</li>
                                <li>Moved all calls to https to get rid of unsecured content warnings.</li>
                                <li>Optimized the filter by Route/Milepost segment server side script. It should work significantly faster now.</li>
                                <li>Fixed bug with route/milepost filter when using '0' as the from milepost.</li>
                            </ul>
                    <tr>
                        <td class='version'>1.0.1</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Fixed issue with Chrome freezing on the map page.</li>
                                <li>Fixed issue with the map not displaying all of the points that fall within the selected date range.</li>
                                <li>Refined log in process.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>1.0.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Move project to production server and point at <a href='http://wvc.mapserv.utah.gov'>wvc.mapserv.utah.gov</a>.</li>
                                <li>Implemented new UserManagement service.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>0.16.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Changed name from "Roadkill Reporter" to "Wildlife-Vehicle Collision Reporter"</li>
                                <li>Fixed bug related to points recorded far from any roads.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>0.15.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Added Wildlife Fencing layer to map.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>0.14.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Added ability to enter UTM coordinates on data entry page.</li>
                                <li>Removed most placeholder text.</li>
                                <li>Refined pane stack on map page.</li>
                                <li>Removed Mitigation page.</li>
                                <li>Added Wildlife Crossings layer.</li>
                                <li>Added SSL to entire site.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>0.13.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Added ability to filter by route, from and to mileposts.</li>
                                <li>Added Species Chart to map sidebar.</li>
                                <li>Added Print to PDF function to map.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>0.12.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Data Entry page is now working. You can now manually submit reports.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>0.11.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Added text and image to the home page.</li>
                                <li>Added footer to all pages.</li>
                                <li>Added download and filter functionality to "Download" page.</li>
                                <li>Fixed flash of instyled content on map page.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>0.10.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Added Download Data widget to map page.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>0.9.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Added gender, age class, and region filters.</li>
                                <li>Fixed some bugs with user authentication.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class='version'>0.8.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Added authentication functionality.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="version">0.7.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Fixed point clustering bugs.</li>
                                <li>Added the ability to filter by one or more species.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="version">0.6.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Added loader to map page.</li>
                                <li>Popup now works better with point clustering.</li>
                                <li>Re-worked the background layers controls.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td class="version">0.5.0</td>
                        <td>
                            <ul class='list-unstyled'>
                                <li>Added release notes page.</li>
                                <li>Added point clustering to prevent overlaps.</li>
                                <li>Added the beginnings of the Data Filter widget. You can only filter by report date currently.</li>
                                <li>Refined popup that displays after clicking on a report.</li>
                                <li>Loaded data from old database. There are now over 25,000 reports in the database.</li>
                                <li>Upgraded bootstrap to 1.3.0 and ESRI JSAPI to 2.5</li>
                            </ul>
                        </td>
                    </tr>
                </thead>
            </table>
        </div>
    </body>
</html>
