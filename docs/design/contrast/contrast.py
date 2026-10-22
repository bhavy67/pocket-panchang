import json,sys
def lum(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
T=json.load(open(sys.argv[1]))
# (fg, bg, min)
checks=[]
for bg in ['bg','surface','surface-raised','surface-sunken']:
    checks+= [('text',bg,4.5),('text-muted',bg,4.5),('accent',bg,4.5),('danger',bg,4.5),('warning',bg,4.5),
              ('auspicious',bg,4.5),('inauspicious',bg,4.5),('festival',bg,4.5),('personal-event',bg,4.5),
              ('border-strong',bg,3),('focus-ring',bg,3),('now-marker',bg,3)]
checks+=[('text-on-accent','accent',4.5)]
for d in ['auspicious','inauspicious','festival','personal-event','accent','warning']:
    checks+=[('text',d+'-subtle',4.5),(d,d+'-subtle',4.5)]
fails=0
for name,t in T.items():
    worst=99
    for fg,bg,m in checks:
        r=cr(t[fg],t[bg]); worst=min(worst,r)
        if r<m: fails+=1; print(f"FAIL {name}: {fg} on {bg} = {r:.2f} < {m}")
    print(f"{name}: {len(checks)} pairs, min ratio {worst:.2f}")
print("TOTAL FAILS", fails)
