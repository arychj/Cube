import collections

class Tools:
    @staticmethod
    def mergeDict(d, u):
        for k, v in u.items():
           if (k in d and isinstance(d[k], dict) and isinstance(u[k], collections.Mapping)):
                Tools.mergeDict(d[k], u[k])
           else:
                d[k] = u[k]
