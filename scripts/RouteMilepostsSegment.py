from os.path import dirname, join

import arcpy

'''
GP Parameters
0 - route
1 - fromMP
2 - toMP
3 - outSegment - FeatureSet

Test values:
route = '0015'
fromMP = float('5.5')
toMP = float('50.7')
'''

arcpy.env.overwriteoutput = True

# variables
route = arcpy.GetParameterAsText(0) + 'P'
fromMP = float(arcpy.GetParameterAsText(1))
toMP = float(arcpy.GetParameterAsText(2))

# field names
ROUTE = 'ROUTE'
FromMP = 'FROM_MP'
ToMP = 'TO_MP'
LABEL = 'LABEL'

routesFC = r'C:\MapData\transportation.gdb\UDOTRoutes_LRS'
routesLyr = 'routesLyr'
tableTemplate = join(dirname(__file__), r'Schemas.gdb\RouteMilepostsTemplate')
eventLayer = 'eventLayer'
tempTbl = 'tempTbl'

#: need to clean this up if we are running this via Desktop
tbl = join('in_memory', tempTbl)
if arcpy.Exists(tbl):
    arcpy.AddMessage('cleaning up in_memory')
    arcpy.management.Delete(tbl)

if arcpy.env.scratchWorkspace is None:
    output = r'c:\temp'
else:
    output = arcpy.env.scratchWorkspace

# create new in_memory table to hold values
arcpy.AddMessage('creating temp table')
tbl = arcpy.management.CreateTable('in_memory', tempTbl, tableTemplate)

# add new row to table
with arcpy.da.InsertCursor(tbl, [ROUTE, FromMP, ToMP]) as icur:
    icur.insertRow((route, fromMP, toMP))

# create route layer to filter out negative direction routes
arcpy.AddMessage('creating route layer')
arcpy.management.MakeFeatureLayer(routesFC, routesLyr, "{} = '{}'".format(LABEL, route))

# generate route event layer
arcpy.AddMessage('creating route event layer')
arcpy.lr.MakeRouteEventLayer(routesLyr, LABEL, tbl, '{} LINE {} {}'.format(ROUTE, FromMP, ToMP), eventLayer)

with arcpy.da.SearchCursor(eventLayer, ['Shape@']) as cur:
    row = cur.next()
    if row[0] is not None and row[0].length > 0:
        arcpy.AddMessage('copying features')
        fs = arcpy.management.CopyFeatures(eventLayer, join(output, 'outFC'))

        arcpy.SetParameter(3, fs)
    else:
        arcpy.AddError('No match found for that route.')

arcpy.AddMessage("Done")
