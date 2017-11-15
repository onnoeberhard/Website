import os
import webapp2
import jinja2
import cPickle
import random
import urllib
import datetime

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class MainPage(webapp2.RequestHandler):
    def get(self):
        a = self.request.get('a')
        b = self.request.get('b')
        x = self.request.get('x')
        ls = ts = abs_ = bas = lr = tr = abr = bar = None
        with open("kevinBacon.pickle", "rb") as f:
            data = cPickle.load(f)
            users = data['users']
            uids = data['uids']
        if x == "randb" or not (a or b):
            self.redirect("/kevinBacon?x=r&" + urllib.urlencode({'b': random.choice(users.keys())}) + ("&a=" + a if a else ""))
        if a and b:
            aidx = uids.index(users[a])
            bidx = uids.index(users[b])
            ls = "%.0f" % data['S_loose'][aidx][bidx]
            ts = "%.0f" % data['S_tight'][aidx][bidx]
            abs_ = "%.0f" % data['S'][aidx][bidx]
            bas = "%.0f" % data['S'][bidx][aidx]
            lr = "%.6g" % data['R_loose'][aidx][bidx]
            tr = "%.6g" % data['R_tight'][aidx][bidx]
            abr = "%.6g" % data['R'][aidx][bidx]
            bar = "%.6g" % data['R'][bidx][aidx]
            print(data['subnets'])
        template_values = {
            'R': "%.4g" % data['r'],
            'dt': datetime.datetime.strptime(data['dt'], '%Y%m%d%H%M%S').date().isoformat(),
            'a': a,
            'b': b,
            'x': x,
            'ls': ls,
            'ts': ts,
            'abs': abs_,
            'bas': bas,
            'lr': lr,
            'tr': tr,
            'abr': abr,
            'bar': bar,
            'subnets': data['subnets'],
            'isolated': data['isolated'],
            'population': data['largest'],
            'percentage': data['percent'],
            'r': "%.12f" % data['r'],
            's': "%.12f" % data['s'],
            'n': len(uids)
        }
        template = JINJA_ENVIRONMENT.get_template('kevinBacon.html')
        self.response.write(template.render(template_values))


app = webapp2.WSGIApplication([
    ("/kevinBacon", MainPage),
], debug=True)