"""
UpdateDatabaseConnections.py

Loops through all of the mxd's and points the roadkill database connections
to the test or production database.

Scott Davis
5-14-2012
"""

import arcpy
from os import getcwd
from glob import glob1
from agrc import agserver

prod = r'C:\PythonScripts\DatabaseConnections\Roadkill_PROD as RKAdmin.sde'
prodService = u'<prod service>'
test = r'C:\PythonScripts\DatabaseConnections\Roadkill_TEST as RKAdmin.sde'
testService = u'<test service>'
services = [['FeatureService', 0],
            ['MapService', 0],
            ['Overlays', 0],
            ['PublicToolbox', 2],
            ['Toolbox', 2]]
servicesBase = r'Roadkill/'

serv = agserver.Services()

type = raw_input("Switch mxd's in current folder to 'prod' or 'test': ")

if type == 'prod':
    new = prod
    oldService = testService
elif type == 'test':
    new = test
    oldService = prodService
else:
    raise 'prod or test not recognized!'

mxds = glob1(getcwd(), '*.mxd')
msds = glob1(getcwd(), '*.msd')

for filename in mxds:
    print filename

    mxd = arcpy.mapping.MapDocument(filename)

    lyrs = arcpy.mapping.ListLayers(mxd)

    for l in lyrs:
        if l.supports("SERVICEPROPERTIES") and l.serviceProperties['ServiceType'] == 'SDE':
            if l.serviceProperties['Service'] == oldService:
                l.replaceDataSource(new, 'SDE_WORKSPACE')
                print l.name + ' updated.'

    mxd.save()
    print 'mxd saved'

    msd = filename[:-4] + '.msd'
    if msd in msds:
        arcpy.mapping.ConvertToMSD(mxd, msd)
        print 'msd saved'

print 'restarting services'
for s in services:
    serv.commandService(servicesBase + s[0], '-r', serv.serviceTypes[s[1]])

print 'done'
