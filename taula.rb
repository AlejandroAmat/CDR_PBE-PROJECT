require 'json'
require 'gtk3'

class Taula
  attr_accessor :taula, :css_provider, :style_prov
  @files
  @columnes
  
  def crearTaula(raw_data)
    @files =0
    @columnes=0
    @css_provider= Gtk::CssProvider.new
    @css_provider.load_from_path('stylesheet.css')
    @style_prov = Gtk::StyleProvider::PRIORITY_USER
    
    json = JSON.parse(raw_data) #convertim el que rebem  del servidor a JSON
    resp = json["result"] #cogemos la información almacenada en la etiqueta result
    puts resp
    @files = resp.size
    if @files!=0  #En caso de no ser una resultado vacío
        @columnes = resp[0].size
        puts @files
        puts @columnes
        @taula = Gtk::Table.new(@files, @columnes, true) #Creamos table y ponemos variable homogenous a true
        
        @files.times do |i| #iteramos para cada fila y creamos las labels para cada atrubuto de la fila
               
                if i==0
                crearPrimeraFila(resp[0])
                else
                labels = crearLabels(resp[i], i+1)
                puts labels
                afegirFila(labels, i+1)
                puts labels 
                end
                
        end
        return @taula
    end
    return nil
  end
  
  def crearPrimeraFila(hash) #Insertamos la primera fila con los tags y la segunda con los valores
    labels = []
    labelsu =[]
    hash.each do |key, value|
        
      if key=="date"
        labelu = Gtk::Label.new(value[0,10])
      else
        if key =="mark" 
        labelu = Gtk::Label.new(value.to_s)
        else
        labelu = Gtk::Label.new(value)
        end
      end
        
        labelu.set_name("fila_parell")
        labelu.style_context.add_provider(@css_provider, @style_prov)
        labelsu.push(labelu)
        label = Gtk::Label.new(key)
        label.set_name("fila0")
        label.style_context.add_provider(@css_provider, @style_prov)
        labels.push(label)
    end
    afegirFila(labels,0)
    afegirFila(labelsu,1)
  end
  
  def crearLabels(hash, i) # para cada fila iteramos por el hash que proporciona JSON y creamos la label correspondiente. Lo metemos en el vector de labels que luego pasamos a la función afegirfila
    labels=[]
    hash.each do |key, value|
    
      if key=="date"
        label = Gtk::Label.new(value[0,10])
      else
        if key =="mark" 
        label = Gtk::Label.new(value.to_s)
        else
        label = Gtk::Label.new(value)
        end
      end
      
      if i%2 == 0
        label.set_name("fila_parell")
      else
        label.set_name("fila_imparell")
      end
      
      label.style_context.add_provider(@css_provider, @style_prov)
      labels.push(label)
    end
    return labels
  end
  
  def afegirFila(labels, fila) 
    i =0
    loop do
    
    if i==@columnes 
        break
    end
    
    @taula.attach(labels[i],i,i+1,fila, fila+1, nil, nil, 3, 3)
    i=i+1

  end
  end
  
  
   def numFiles
      return @files
   end
end
